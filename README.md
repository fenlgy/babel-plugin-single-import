# babel-plugin-single-import
依赖 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) ， 增加 preDirectory

``` javascript
import { Button,Input } from 'libName';
// =>
import Button from 'libName/lib/button'
import Input from 'libName/lib/input'
```

## Usage
```
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

// =>
import Button from 'myLib/libA/components/button'
import Input from 'myLib/libA/components/input'

import Button from 'myLib/libB/lib/button'
import Input from 'myLib/libB/lib/input'

```