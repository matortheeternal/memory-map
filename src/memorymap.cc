#include "nan.h"
#include "windows.h"
#include "fileapi.h"
#include "memoryapi.h"

std::string GetLastErrorAsString() {
	DWORD errorMessageID = ::GetLastError();
	if (errorMessageID == 0)
		return std::string("Unknown Error");

	LPSTR messageBuffer = nullptr;
	size_t size = FormatMessageA(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
		NULL, errorMessageID, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&messageBuffer, 0, NULL);

	std::string message(messageBuffer, size);
	LocalFree(messageBuffer);

	return message;
}

class MemoryMap : public Nan::ObjectWrap {
public:
	static NAN_MODULE_INIT(Init) {
		v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
		tpl->SetClassName(Nan::New("MemoryMap").ToLocalChecked());
		tpl->InstanceTemplate()->SetInternalFieldCount(5);

		Nan::SetPrototypeMethod(tpl, "getHandle", GetHandle);
		Nan::SetPrototypeMethod(tpl, "setPos", SetPos);
		Nan::SetPrototypeMethod(tpl, "getPos", GetPos);
		Nan::SetPrototypeMethod(tpl, "getSize", GetSize);
		Nan::SetPrototypeMethod(tpl, "read", Read);

		constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
		Nan::Set(target, Nan::New("MemoryMap").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
	}

private:
	explicit MemoryMap(const std::string& filePath) : filePath_(filePath) {
		fileHandle_ = CreateFile(
			filePath_.c_str(),
			GENERIC_READ,
			FILE_SHARE_READ,
			NULL,
			OPEN_EXISTING,
			FILE_FLAG_RANDOM_ACCESS,
			0
		);
		if (fileHandle_ == NULL) {
			std::string err = "Error creating file handle:\n" + GetLastErrorAsString();
			Nan::ThrowError(err.c_str());
			return;
		}

		mapHandle_ = CreateFileMapping(
			fileHandle_,
			NULL,
			PAGE_READONLY,
			0,
			0,
			NULL
		);
		if (mapHandle_ == NULL) {
			std::string err = "Error creating map handle:\n" + GetLastErrorAsString();
			Nan::ThrowError(err.c_str());
			return;
		}

		viewPtr_ = MapViewOfFileEx(
			mapHandle_,
			FILE_MAP_READ,
			0,
			0,
			0,
			NULL
		);
		if (viewPtr_ == NULL) {
			std::string err = "Error creating view pointer:\n" + GetLastErrorAsString();
			Nan::ThrowError(err.c_str());
			return;
		}

		fileSize_ = GetFileSize(fileHandle_, NULL);
		endPtr_ = static_cast<char*>(viewPtr_) + fileSize_;
	}

	~MemoryMap() {
		if (viewPtr_ != NULL) {
			UnmapViewOfFile(viewPtr_);
			viewPtr_ = NULL;
		}

		if (mapHandle_ != NULL) {
			CloseHandle(mapHandle_);
			mapHandle_ = NULL;
		}

		if (fileHandle_ != NULL) {
			CloseHandle(fileHandle_);
			fileHandle_ = NULL;
		}
	}

	static NAN_METHOD(New) {
		if (info.IsConstructCall()) {
			Nan::Utf8String utf8_value(info[0]);
			int len = utf8_value.length();
			std::string filePath(*utf8_value, len);
			MemoryMap *obj = new MemoryMap(filePath);
			obj->Wrap(info.This());
			info.GetReturnValue().Set(info.This());
		} else {
			const int argc = 1;
			v8::Local<v8::Value> argv[argc] = { info[0] };
			v8::Local<v8::Function> cons = Nan::New(constructor());
			info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
		}
	}

	static NAN_METHOD(GetHandle) {
		MemoryMap* obj = Nan::ObjectWrap::Unwrap<MemoryMap>(info.Holder());
		info.GetReturnValue().Set(obj->handle());
	}

	static NAN_METHOD(SetPos) {
		MemoryMap* obj = Nan::ObjectWrap::Unwrap<MemoryMap>(info.Holder());
		DWORD newPos = info[0]->Uint32Value();
		if (newPos > obj->fileSize_) {
			Nan::ThrowError("Position out of bounds.");
			return;
		}
		obj->pos_ = newPos;
	}

	static NAN_METHOD(GetPos) {
		MemoryMap* obj = Nan::ObjectWrap::Unwrap<MemoryMap>(info.Holder());
		v8::Local<v8::Uint32> retval = Nan::New<v8::Uint32>((uint32_t)obj->pos_);
		info.GetReturnValue().Set(retval);
	}

	static NAN_METHOD(GetSize) {
		MemoryMap* obj = Nan::ObjectWrap::Unwrap<MemoryMap>(info.Holder());
		v8::Local<v8::Uint32> retval = Nan::New<v8::Uint32>((uint32_t)obj->fileSize_);
		info.GetReturnValue().Set(retval);
	}

	static NAN_METHOD(Read) {
		MemoryMap* obj = Nan::ObjectWrap::Unwrap<MemoryMap>(info.Holder());
		const char* data = static_cast<char*>(obj->viewPtr_) + obj->pos_;
		if (data + info[0]->Uint32Value() > obj->endPtr_) {
			Nan::ThrowError("Read out of bounds.");
			return;
		}
		Nan::MaybeLocal<v8::Object> buf = Nan::CopyBuffer(data, info[0]->Uint32Value());
		info.GetReturnValue().Set(buf.ToLocalChecked());
	}

	static inline Nan::Persistent<v8::Function> & constructor() {
		static Nan::Persistent<v8::Function> my_constructor;
		return my_constructor;
	}

	std::string filePath_;
	DWORD pos_ = 0;
	DWORD fileSize_ = 0;
	HANDLE fileHandle_ = nullptr;
	HANDLE mapHandle_ = nullptr;
	LPVOID viewPtr_ = nullptr;
	const char* endPtr_ = nullptr;
};

NODE_MODULE(memorymap, MemoryMap::Init)
