# babel-plugin-single-import
依赖 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) ， 增加 preDirectory

``` javascript
import { Button,Input } from 'libName';
// output =>
import Button from 'libName/lib/button'
import Input from 'libName/lib/input'
```

## Usage
``` javascript
//.babelrc option
{
  "plugins": [
          "transform-remove-console",
          ["single-import", [
            {"libraryName": "libA", "libraryDirectory": "components","preDirectory":"myLib"},
            {"libraryName": "libB", "libraryDirectory": "lib","preDirectory":"myLib"}
            ]]
        ]
}

// source
import { Button,Input } from 'libA';
import { Button,Input } from 'libB';

// output =>
import Button from 'myLib/components/libA/button'
import Input from 'myLib/components/libA/input'

import Button from 'myLib/lib/libB/button'
import Input from 'myLib/lib/libB/input'

```
