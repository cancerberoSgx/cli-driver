Adds support for manipulating the mouse in cli-driver

The mouse can be programatically manipulated, like robotjs does but in the context and semantics of the terminal (for example in cols, rows coordinates instead of pixels)

TODO: a great companoin utility for this one would be getTextInRegion() or something likt this - for knowing where should i move the mouse to click something. that utility could be part of the core cli-driver

TODO: decide if we include this in cli-driver or if we distribute this as a separate package since it adds some heavy depdencncies (robotjs and terminal-kit or bless) and probably is not so imrpotant to support mouse-drive in terminal. 


STEP 1 (done)  - be able to focus the terminal windows so we can start working with terminal-kit


STEP 2 : detec te edges of the terminal. We need to map desktop coordinates (x,y) to terminal coords (rows, cols)