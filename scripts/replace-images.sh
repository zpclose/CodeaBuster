#!/bin/bash

# Add import statement to _app.tsx if missing
if ! grep -q "import CustomImage" pages/_app.tsx; then
echo "import CustomImage from \"../components/CustomImage\";" | cat - pages/_app.tsx > pages/_app.tsx.tmp && mv pages/_app.tsx.tmp pages/_app.tsx || true
fi

# Replace <img with <CustomImage in all .tsx files
find pages -name "*.tsx" -exec sh -c 'echo "Processing {}" && [ -f "{}" ] && sed -i "s/<img\b/<CustomImage/g" "{}"' \; 2>/dev/null
find components -name "*.tsx" -exec sh -c 'echo "Processing {}" && [ -f "{}" ] && sed -i "s/<img\b/<CustomImage/g" "{}"' \; 2>/dev/null

echo "Image replacement completed"