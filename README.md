# protocol uploader
protocol uplader is a CLI tool to upload a protocol to Opentrons Flex/OT-2

## dependencies
- TypeScript V6
- tsx
- @types/node


## requirements
- node v22+
- bun / npm / pnpm

## how to build & install protocol uploader
```shell
# bun
bun run build && bun add -g .

# npm
npm run build && npm install -g .

# pnpm
pnpm run build && pnpm install -g .

```

## how to use protocol uploader
```shell
pup path/to/protocol --ip "robot_ip-address"
```

ex
```shell
pup 96_channel_test.py --ip 192.168.1.23
```
