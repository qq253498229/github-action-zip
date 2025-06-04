# action zip

## 用法

压缩文件

```yaml
name: Main

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Zip file
        uses: qq253498229/github-action-zip@v1
        with:
          files: |
            1so.dmg.zip -> ./tests/一搜_0.1.0_x64.dmg
      - run: ls -al

```

压缩多个文件

```yaml
name: Main

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Zip file
        uses: qq253498229/github-action-zip@v1
        with:
          files: |
            1so.dmg.zip -> ./tests/一搜_0.1.0_x64.dmg,./tests/一搜.app,./tests/1.txt
            1.txt.zip -> ./tests/1.txt
      - run: ls -al

```
