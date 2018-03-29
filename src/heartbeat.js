const isFunction = require("lodash.isfunction");

/**
 * @constant
 * @default
 * @description     Default timeout of all heartbeat objects.
 * @see             <code>setBeatTimeout</code>
 * @see             <code>getBeatTimeout</code>
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * @constant
 * @default
 * @description     Default heartbeat interval of all heartbeat objects.
 * @see             <code>setBeatInterval</code>
 * @see             <code>getBeatInterval</code>
 */
const DEFAULT_INTERVAL = 3000;

/**
 *  @public
 *  @author Pedro Miguel Pereira Serrano Martins
 *  @version 1.0.3
 *  @module heartBeat
 *  @desc   Factory function that creates heartbeat objects with a default Timeout of <code>DEFAULT_TIMEOUT</code> seconds and a default BeatInterval of <code>DEFAULT_INTERVAL</code> seconds. 
 *          The heartbeat returned is stopped and needs to be started to execute.
 */
const heartBeatFactory = () => {

    let interval = DEFAULT_INTERVAL,
        timeout = DEFAULT_TIMEOUT,
        ping,
        pong,
        timer,
        lastHeartbeatTime,
        timeoutTimer,
        timeoutFn = () => { };

    /**
     *  @public
     *  @func         hasTimedOut
     *  @returns      {Boolean}   <code>true</code> if the heartbeat has timedout,
     *                          <code>false</code> otherwise.
     *
     *  @description  Used to detected if a heartbeat has timedout.
     *                A heartbeat times out when it sends a ping, and receives no pong after a given period of time.
     *                The timeout period can be manipulated via <code>setBeatTimeout</code>.
     * @see             <code>setBeatTimeout</code>
     */
    const hasTimedOut = () =>
        Date.now() - lastHeartbeatTime > timeout;

    /**
     *  @public
     *  @func       getBeatInterval
     *  @returns    {Number}        The current heartbeat interval.
     *
     *  @description    Returns the current hearbeat interval.
     *                  The heartbeat interval is the interval at which the heartbeat will run the <code>ping</code> function.
     */
    const getBeatInterval = () => interval;

    /**
     *  @public
     *  @func   setBeatInterval
     *  @param  {Number}        newInterval The new heartbeat interval.
     *  @throws {TypeError}     If <code>newInterval</code> is not a Number.
     *
     *  @description    Sets the current heartbeat interval to the given one.
     *                  Note that setting the heartbeat interval will <b>not</b> affetct current heartbeat running. You must <code>stop</code> them and then <code>start</code> them for the new interval to be applied.
     * @see             <code>stop</code>
     * @see             <code>start</code>
     */
    const setBeatInterval = newInterval => {
        if(isNaN(newInterval))
            throw new TypeError(`${newInterval} must be a Number.`);

        interval = newInterval;
    };

    /**
     *  @public
     *  @func       getBeatTimeout
     *  @returns    {Number}        The current timeout.
     *
     *  @description    Returns the current hearbeat timeout.
     *                  The heartbeat timeout is the amount of time that must pass for the <code>hasTimedOut</code> to return <code>true</code>.
     * @see             <code>hasTimedOut</code>
     */
    const getBeatTimeout = () => timeout;

    /**
     *  @public
     *  @func   setBeatTimeout
     *  @param  {Number}        newTimeout  The new newTimeout.
     *  @throws {TypeError}     If <code>newTimeout</code> is not a Number.
     *
     *  @description    Sets the current timeout to the given one.
     *                  Setting the timeout this way will immediatly affect the <code>hasTimedOut</code> method without the need to restart the heartbeat object.
     *                  Invoking this method <b>does</b> restart the timer controlling the <code>onTimeout</code> event.
     *  @see            <code>hasTimedOut</code>
     *  @see            <code>onTimeout</code>
     */
    const setBeatTimeout = newTimeout => {
        if(isNaN(newTimeout))
            throw new TypeError(`${newTimeout} must be a Number.`);

        timeout = newTimeout;
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout( timeoutFn, timeout );
    };

    /**
     *  @public
     *  @func       getPing
     *  @returns    {Object}    The current object being used as a ping.
     *
     *  @description    Returns the ping object being used.
     */
    const getPing = () => ping;

    /**
     *  @public
     *  @func   setPing
     *  @param  {Object}    newPing  The new ping object.
     *
     *  @description    Sets the current ping object.
     *                  A ping object can be anything that the receiver accepts, from a Buffer of bytes to plain Object to a primitive.
     */
    const setPing = newPing => {
        ping = newPing;
    };

    /**
     *  @public
     *  @func       getPong
     *  @returns    {Object}    The current object being used as a pong.
     *
     *  @description    Returns the pong object being used.
     */
    const getPong = () => pong;

    /**
     *  @public
     *  @func   setPong
     *  @param  {Object}    newPong  The new pong object.
     *
     *  @description    Sets the pong object we expect to receive from the target of the heartbeats.
     *                  This is only needed if there is a need to distinguish between normal messages from the target of heartbeat and pong messages that need to be processed differently.
     */
    const setPong = newPong => {
        pong = newPong;
    };

    /**
     *  @public
     *  @func       receivedPong
     *
     *  @description    Notifies the hearbeat that it has received a pong from the target.
     */
    const receivedPong = () => {
        lastHeartbeatTime = Date.now();
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout( timeoutFn, timeout );
    };

    /**
     *  @public
     *  @func   stop
     *
     *  @description    Stops the heartbeat object and clears all internal states.
     */
    const stop = () => {
        lastHeartbeatTime = undefined;
        clearInterval(timer);
        timer = undefined;
        clearTimeout(timeoutTimer);
        timeoutTimer = undefined;
    };

    /**
     *  @public
     *  @func   start
     *  @param  {Function}  fn  The function that will be executed periodically
     *                          by the heartbeat object.
     *  @throws {TypeError}     If <code>fn</code> is not a function.
     *
     *  @description    Starts the heartbeat object, executing the given function <code>fn</code> every interval.
     *                  If you want to send a ping to an object every interval, this is where you defined that.
     */
    const start = fn => {
        if (!isFunction(fn))
            throw new TypeError(`${fn} must be a function.`);

        lastHeartbeatTime = Date.now();
        timer = setInterval( fn, interval );
        timeoutTimer = setTimeout( timeoutFn, timeout );
    };

    /**
     *  @public
     *  @func   onTimeout
     *  @param  {Function}  fn  The function to be executed when a timeout
     *                          occurs.
     *  @throws {TypeError}     If <code>fn</code> is not a function.
     *
     *  @description    Runs the given function when the heartbeat detects a timeout.
     *                  A timeout is deteceted if <code>receivedPong</code> is not called within the defined 'timeout' period.
     */
    const onTimeout = fn => {
        if (!isFunction(fn))
            throw new TypeError(`${fn} must be a function.`);

        timeoutFn = fn;
    };

    /**
     *  @public
     *  @func       isBeating
     *  @returns    {Boolean}   <code>true</code> if the heartbeat is active,
     *                          <code>false</code> otherwise.
     *
     *  @description    Returns <code>true</code> if the heartbeat is active, <code>false</code> otherwise.
     *                  A heartbeat is considered active if it was started and has not beend stopped yet.
     */
    const isBeating = () => timer !== undefined;

    /**
     *  @public
     *  @func   reset
     *
     *  @description    Stops the heartbeat if it is beating, and resets all properties to the original default values.
     */
    const reset = () => {
        stop();

        interval = DEFAULT_INTERVAL;
        timeout = DEFAULT_TIMEOUT;
        ping = undefined;
        pong = undefined;
        timeoutFn = () => { };
    };

    return Object.freeze({
        getBeatInterval,
        setBeatInterval,
        getBeatTimeout,
        setBeatTimeout,
        hasTimedOut,
        getPing,
        setPing,
        getPong,
        receivedPong,
        setPong,
        stop,
        start,
        reset,
        isBeating,
        onTimeout
    });
};

module.exports = heartBeatFactory;
