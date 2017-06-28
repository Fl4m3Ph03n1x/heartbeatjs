[![Build Status](https://travis-ci.org/Fl4m3Ph03n1x/heartbeastjs.svg?branch=master)](https://travis-ci.org/Fl4m3Ph03n1x/heartbeastjs)
[![codecov](https://codecov.io/gh/Fl4m3Ph03n1x/heartbeastjs/branch/master/graph/badge.svg)](https://codecov.io/gh/Fl4m3Ph03n1x/heartbeastjs)
[![Dependency Status](https://www.versioneye.com/user/projects/59538da0368b08006483b4ab/badge.svg)](https://www.versioneye.com/user/projects/59538da0368b08006483b4ab)
[![Code Climate](https://codeclimate.com/github/Fl4m3Ph03n1x/heartbeastjs/badges/gpa.svg)](https://codeclimate.com/github/Fl4m3Ph03n1x/heartbeastjs)
[![Inline docs](http://inch-ci.org/github/Fl4m3Ph03n1x/heartbeastjs.svg?branch=master)](http://inch-ci.org/github/Fl4m3Ph03n1x/heartbeastjs)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

#   What

`heartbeatjs` is a small light weight library that helps you run periodic
heartbeat functions and detects timeouts when they occur by launching events.

It was mainly designed for tcp/ip connections, but you can use it with any
protocol you want as it designed to be generic.

#   Why

When you are connected to a third party mahcine (aka target), most of the time
you need to know if the target is alive or not.

To do this, there are two common scenarios:

 1. the target notifies you when it is about to go down
 2. you poll the target to check its status

In cases where the first scenario doesn't happen or it is incomplete, you need
to resort to polling to check on it.

`heartbeatjs` was desgined for this purpose and its function is to help you poll
targets.

#   How

Following are instructions on how to intsall and use `heartbeatjs`. For more
information about the project you can check the GitHub page:

 - [heartbeastjs Github](https://github.com/Fl4m3Ph03n1x/heartbeastjs)

And for questions you can ask in the issues page:

 - [heartbeastjs Issues](https://github.com/Fl4m3Ph03n1x/heartbeastjs/issues)

Feel free to check the [heartbeastjs project page](https://fl4m3ph03n1x.github.io/heartbeastjs/index.html)
for additional information as well.

## Install

    npm install heartbeatjs --save

## API

 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~getBeatInterval__anchor">getBeatInterval</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~setBeatInterval__anchor">setBeatInterval</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~getBeatTimeout__anchor">getBeatTimeout</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~setBeatTimeout__anchor">setBeatTimeout</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~hasTimedOut__anchor">hasTimedOut</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~getPing__anchor">getPing</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~setPing__anchor">setPing</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~getPong__anchor">getPong</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~setPong__anchor">setPong</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~receivedPong__anchor">receivedPong</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~stop__anchor">stop</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~start__anchor">start</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~reset__anchor">reset</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~isBeating__anchor">isBeating</a>
 - <a href="https://fl4m3ph03n1x.github.io/heartbeastjs/module-heartBeat.html#~onTimeout__anchor">onTimeout</a>

##  Examples

Start a heartbeat that sends a message periodically to a target, with
DEFAULT.TIMEOUT 5s and DEFAULT.INTERVAL 3s:

        const net = require('net');
        const heartbeatFactory = require("heartbeatjs");

        const myHeartBeat = heartbeatFactory();
        const client = net.createConnection({ port: 8124 }, () => {

            //'connect' listener
            console.log('connected to target!');

            myHeartBeat.start(() => {
                client.write("Hello World!");    
            });
        });


Now let's say that everytime we get a message, we consider it a pong:

        client.on("data", data => {
            myHeartBeat.receivedPong();
            //timeout timer resetted!
        });

Heartbeat with custom Pings and Pongs:

        const client = net.createConnection({ port: 8124 }, () => {

            //'connect' listener
            console.log('connected to target!');

            myHeartBeat.setPing("Marco");
            myHeartBeat.setPong("Polo");
            myHeartBeat.start(() => {
                //send ping every 3s
                client.write(myHeartBeat.getPing());    
            });
        });

        client.on("data", data => {
            if(data === myHeartBeat.getPong()){
                myHeartBeat.receivedPong();
                return;
            }

            //process data                
        });

Listen to when target dies via timeout:

        const client = net.createConnection({ port: 8124 }, () => {

            //'connect' listener
            console.log('connected to target!');

            myHeartBeat.onTimeout(() => console.log("Timed Out!"));
            myHeartBeat.start(() => {
                //send ping every 3s
                client.write("Hello World");    
            });
        });
