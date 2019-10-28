{
  "targets": [
    {
      "target_name": "memorymap",
      "sources": [
        "src/memorymap.cc"
      ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ],
}
