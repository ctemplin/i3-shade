# i3-shade
Auto show/hide floating windows in the [i3 window manager](https://github.com/i3/i3).

## Install
### from npm:
~~~
$ npm install -g i3-shade
~~~

>using [nvm](https://github.com/nvm-sh/nvm) can ease permissions issues

### from source:

~~~
$ git clone --depth=1 https://github.com/ctemplin/i3-shade.git
~~~

#### OR

~~~
$ npx degit github.com/ctemplin/i3-shade.git i3-shade
~~~

#### THEN

~~~
$ cd i3-shade
$ npm install
$ # link from a directory on your $PATH
$ ln -s /usr/local/bin/i3-shade ./src/index.js
~~~

## Config
Disabling `focus_follows_mouse` is recommended. Otherwise, floating windows may disappear unexpectedly.
~~~
# ~/.i3/config
focus_follows_mouse no
~~~

Add a key combination to exempt the current window from shading.
~~~
# ~/.i3/config
bindsym $mod+Ctrl+space nop i3-shade-exempt
~~~

~~~
$ i3-msg reload
~~~


## Run
### In terminal:
~~~
$ i3-shade &
~~~
### Automatically:
~~~
# ~/.i3/config
exec_always --no-startup-id i3-shade
~~~

~~~
$ i3-msg restart
~~~


## Options
> ~~~
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
>     --command=<string>
>                   Defaults to "nop i3-shade-exempt". The i3 command to toggle
>                   the shading exemption for the focused window.
> ~~~