exports.usage = "usage i3-shade [-h|--help] [--prefix=<string>] [--exempt=<string>]\n\
                [--command=<string>] [--fallback=<string>]\n"

exports.helpText = "i3-shade\n\
    -h            Show brief usage summary.\n\
    --help        Show this message.\n\
    --prefix=<string>\n\
                  Defaults to \"shade\". Included in mark that stores \n\
                  floating window position. No need to set unless default\n\
                  conflicts with other marks.\n\
                  <prefix>_<x>_<y>_<con_id> \n\
    --exempt=<string>\n\
                  Defaults to \"shade_exempt\". Included in mark that exempts\n\
                  containers from shading. No need to set unless default\n\
                  conflicts with other marks.\n\
                  _<exempt>_<con_id> \n\
    --socketpath=<string>\n\
                  Defaults to output of `i3 --get-socketpath`.\n\
    --command=<string>\n\
                  Defaults to \"nop i3-shade-exempt\". The i3 command to toggle\n\
                  the shading exemption for the focused window. \n\
    --fallback=<string>\n\
                  Defaults to null. An i3 command to run if the 'focus mode_toggle'\n\
                  command cannot find an eligible window to focus.\n"
