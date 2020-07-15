# Short Unique ID

Generates short and unique IDs

## Example

```
import { ShortUniqueId } from '@informatix8/short-unique-id';

const generator = new ShortUniqueId();
console.log(generator.hash('aaa'));
console.log(generator.hash('aaa', 100));
```
