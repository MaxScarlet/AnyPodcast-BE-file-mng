# rm -rf dist_layer
# ts-node shrinker.ts
mv dist dist_layer
cd ./dist_layer
mkdir -p nodejs
sleep 1
mv node_modules nodejs