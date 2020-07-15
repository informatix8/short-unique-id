# Short Unique ID

Generates short and unique IDs

## Example

```
import { ShortUniqueId } from '@informatix8/short-unique-id';

const generator = new ShortUniqueId();
console.log(generator.hash('aaa'));
console.log(generator.hash('aaa', 100));
```

## Release

```shell
npm run build
git tag -a vX.Y.Z
git push origin master
git push origin --tags
npm publish --access=public .
```
