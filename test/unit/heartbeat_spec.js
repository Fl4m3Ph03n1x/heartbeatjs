const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const heartBeatFactory = require("../../src/heartbeat.js");

describe("heartBeat", () => {

    const PING = Buffer.from([0x01]);
    const PONG = Buffer.from([0x02]);
    const DEFAULT = {
        TIMEOUT: 5000,
        INTERVAL: 3000
    };

    let clock,
        heartBeat;

    before("setup clock and heartbeat", () => {
        clock = sinon.useFakeTimers();
        heartBeat = heartBeatFactory();
    });

    afterEach("reset heartbeat", () => {
        heartBeat.reset();
    });

    after("restoring timers", () => {
        clock.restore();
    });

    it("should get ping", () => {
        const expected = PING;
        heartBeat.setPing( PING );

        const actual = heartBeat.getPing();
        expect( actual ).to.eql( expected );
    });

    it("should set ping", () => {
        const newPing = Buffer.from([0x03]);
        heartBeat.setPing(newPing);

        const actual = heartBeat.getPing();
        expect( actual ).to.eql( newPing );
    });

    it("should get pong", () => {
        heartBeat.setPong(PONG);
        const actual = heartBeat.getPong();
        expect( actual ).to.eql( PONG );
    });

    it("should set pong", () => {
        const newPong = Buffer.from([0x04]);
        heartBeat.setPong( newPong );

        const actual = heartBeat.getPong();
        expect( actual ).to.eql( newPong );
    });

    it("should get interval", () => {
        const actual = heartBeat.getBeatInterval();
        expect( actual ).to.eql( DEFAULT.INTERVAL );
    });

    it("should set interval", () => {
        const newInterval = 500;
        heartBeat.setBeatInterval(newInterval);
        const actual =  heartBeat.getBeatInterval();
        expect( actual ).to.eql( newInterval );
    });

    it("should get timeout", () => {
        const actual = heartBeat.getBeatTimeout();
        expect( actual ).to.eql( DEFAULT.TIMEOUT );
    });

    it("should set timeout", () => {
        const newTimeout = 3000;
        heartBeat.setBeatTimeout(newTimeout);
        const actual = heartBeat.getBeatTimeout();
        expect( actual ).to.eql( newTimeout );
    });

    it("should throw if 'setBeatTimeout' is invoked without a Number param", () => {
        expect( heartBeat.setBeatTimeout.bind(null, "Hellow World") ).to.throw( TypeError );
    });

    it("should throw if 'setBeatInterval' is invoked without a Number param", () => {
        expect( heartBeat.setBeatInterval.bind(null, "Hellow World") ).to.throw( TypeError );
    });

    it("should not be beating before being started", () => {
        expect( heartBeat.isBeating() ).to.be.false;
    });

    it("should throw if 'pingFn' is not a function", () => {
        expect( heartBeat.start.bind(undefined, "Hello World") ).to.throw( TypeError );
    });

    it("should call the given 'fn' on every interval after it starts", () => {
        const spy = sinon.spy(),
            interval = 25;
        heartBeat.setBeatInterval( interval );
        heartBeat.start( spy );

        clock.tick( interval * 2 );
        expect( spy.calledTwice ).to.be.true;
    });

    it("should stop calling 'pingFn' when it stops", () => {
        const spy = sinon.spy(),
            interval = 25;
        heartBeat.setBeatInterval( interval );
        heartBeat.start( spy );

        //one interval and half
        clock.tick( interval + interval / 2 );

        heartBeat.stop();
        expect( spy.calledOnce ).to.be.true;
    });

    it("should be beating after it is started", () => {
        const interval = 10;
        heartBeat.setBeatInterval( interval );
        heartBeat.start( () => { } );
        clock.tick( interval );
        expect( heartBeat.isBeating() ).to.be.true;
    });

    it("should not be beating after being stoppedd", () => {
        const interval = 10;
        heartBeat.setBeatInterval( interval );

        heartBeat.start( () => {} );
        clock.tick( interval );
        heartBeat.stop();

        expect( heartBeat.isBeating() ).to.be.false;
    });

    it("should be aware of a timeout when it doesn't receive a pong withing 'timeout'", () => {
        const timeout = 5,
            interval = 10;
        heartBeat.setBeatTimeout( timeout );
        heartBeat.setBeatInterval( interval );

        heartBeat.start( () => {} );
        clock.tick( interval );
        expect( heartBeat.hasTimedOut() ).to.be.true;
    });

    it("should not time timeout if it recieves pongs", () => {
        const interval = 10,
            timeout = 20;
        heartBeat.setBeatTimeout( timeout );
        heartBeat.setBeatInterval( interval );

        heartBeat.start( heartBeat.receivedPong );

        clock.tick( 50 );
        expect( heartBeat.hasTimedOut() ).to.be.false;
    });

    it("should run 'onTimeout' when a timeout happens", () => {
        const timeout = 10;
        const timeoutSpy = sinon.spy();

        heartBeat.setBeatTimeout( timeout );
        heartBeat.onTimeout( timeoutSpy );

        heartBeat.start( () => {} );
        clock.tick( timeout );

        expect( timeoutSpy.calledOnce ).to.be.true;
    });

    it("should throw if 'onTimeout' is not called with a function", () => {
        expect( heartBeat.onTimeout.bind(null, "hello world") ).to.throw( TypeError );
    });

    it("should reset to the default values", () => {
        heartBeat.start( () => {} );
        heartBeat.reset();
        expect( heartBeat.getBeatTimeout() ).to.eql( DEFAULT.TIMEOUT );
        expect( heartBeat.getBeatInterval() ).to.eql( DEFAULT.INTERVAL );
    });

    it("should not invoke 'onTimeout' if a timeout does not occur", () => {
        const newHeartbeat = heartBeatFactory();
        const timeoutSpy = sinon.spy();
        newHeartbeat.onTimeout( timeoutSpy );
        newHeartbeat.reset();

        clock.tick( 6000 );

        expect( timeoutSpy.called ).to.be.false;
    });
});
