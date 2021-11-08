# i3-shade
Auto show/hide floating windows in the [i3 window manager](/i3/i3).

## Install
> ```
> $ git clone --depth=1 https://github.com/ctemplin/i3-shade.git
#### OR
> ```
> $ npx degit github.com/ctemplin/i3-shade.git i3-shade 

> ```
> $ cd i3-shade
> $ npm install

## Config
Note: Disabling `focus_follows_mouse` is recommended. Otherwise, floating windows may disappear unexpectedly.
> ```
> # ~/.i3/config
> focus_follows_mouse no


Add a key combination to exempt the current window from shading.
> ```
> # ~/.i3/config
> bindsym $mod+Ctrl+space nop i3-shade-exempt

>```
> $ i3-msg reload


## Run
In terminal:
> ```
> $ i3-shade/src/index.js &

Automatically:
> ```
> # ~/.i3/config
> exec_always --no-startup-id ~/Documents/i3-shade/src/index.js

> ```
> $ i3-msg restart


## Options
> ```
> i3-shade
>     usage: i3-shade [-h|--help] [--prefix=<string>] [--exempt=<string>]
>     -h            Show brief usage summary.
>     --help        Show this message.
>     --prefix=<string>
>                   Defaults to "shade". Included in mark that stores 
>                   floating window position. No need to set unless default
>                   conflicts with other marks.
>                   <prefix>_<x>_<y>_<con_id>
>     --exempt=<string>
>                   Defaults to "shade_exempt". Included in mark that exempts
>                   containers from shading. No need to set unless default
>                   conflicts with other marks.
>                   _<exempt>_<con_id>
