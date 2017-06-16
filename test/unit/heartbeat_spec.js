"use strict";

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

    const heartBeat = Object.assign({}, heartBeatFactory());

    afterEach("reset heartbeat", () => {
        heartBeat.reset();
    });

    it("should get ping", () => {
        heartBeat.setPing(PING);
        expect(heartBeat.getPing()).to.eql(PING);
    });
    it("should set ping", () => {
        const newPing = Buffer.from([0x03]);
        heartBeat.setPing(newPing);
        expect(heartBeat.getPing()).to.eql(newPing);
    });

    it("should get pong", () => {
        heartBeat.setPong(PONG);
        expect(heartBeat.getPong()).to.eql(PONG);
    });
    it("should set pong", () => {
        const newPong = Buffer.from([0x04]);
        heartBeat.setPong(newPong);
        expect(heartBeat.getPong()).to.eql(newPong);
    });

    it("should get interval", () => {
        expect(heartBeat.getBeatInterval()).to.eql(DEFAULT.INTERVAL);
    });
    it("should set interval", () => {
        const newInterval = 500;
        heartBeat.setBeatInterval(newInterval);
        expect(heartBeat.getBeatInterval()).to.eql(newInterval);
    });

    it("should get timeout", () => {
        expect(heartBeat.getBeatTimeout()).to.eql(DEFAULT.TIMEOUT);
    });
    it("should set timeout", () => {
        const newTimeout = 3000;
        heartBeat.setBeatTimeout(newTimeout);
        expect(heartBeat.getBeatTimeout()).to.eql(newTimeout);
    });

    it("should not be beating before being started", () => {
        expect(heartBeat.isBeating()).to.be.false;
    });

    it("should throw if 'pingFn' is not a function", () => {
        expect(heartBeat.start.bind(undefined, "Hello World")).to.throw(TypeError);
    });

    it("should call the given 'fn' on every interval after it starts", done => {
        const spy = sinon.spy();
        heartBeat.setBeatInterval(25);
        heartBeat.start(spy);

        setTimeout(() => {
            expect(spy.calledTwice).to.be.true;
            heartBeat.stop();
            done();
        }, 55);
    });

    it("should stop calling 'pingFn' when it stops", done => {
        const spy = sinon.spy();
        heartBeat.setBeatInterval(25);
        heartBeat.start(spy);

        setTimeout(() => {
            heartBeat.stop();
        }, 40);

        setTimeout(() => {
            expect(spy.calledOnce).to.be.true;
            done();
        }, 50);
    });

    it("should be beating after it is started", done => {
        heartBeat.setBeatInterval(0);
        heartBeat.start(() => {
            expect(heartBeat.isBeating()).to.be.true;
            done();
        });
    });

    it("should not be beating after being stoppedd", done => {
        heartBeat.setBeatInterval(0);
        heartBeat.start(() => {
            heartBeat.stop();
            expect(heartBeat.isBeating()).to.be.false;
            done();
        });
    });

    it("should be aware of a timeout when it doesn't receive a pong withing 'timeout'", done => {
        heartBeat.setBeatTimeout(5);
        heartBeat.setBeatInterval(10);
        heartBeat.start(() => {
            expect(heartBeat.hasTimedOut()).to.be.true;
            done();
        });
    });

    it("should not time timeout if it recieves pongs", done => {
        heartBeat.setBeatTimeout(20);
        heartBeat.setBeatInterval(10);
        heartBeat.start(heartBeat.receivedPong);

        setTimeout(() => {
            expect(heartBeat.hasTimedOut()).to.be.false;
            done();
        }, 50);

    });

    it("should run 'onTimeout' when a timeout happens", done => {
        heartBeat.setBeatTimeout(10);
        heartBeat.onTimeout(done);
        heartBeat.start(sinon.spy());
    });
    
    it("should throw if 'onTimeout' is not called with a function", () => {
        expect(heartBeat.onTimeout.bind(null, "hello world")).to.throw(TypeError);
    });
    
    it("should reset to the default values", () => {
        heartBeat.start(sinon.spy());
        heartBeat.reset();
        expect(heartBeat.getBeatTimeout()).to.eql(DEFAULT.TIMEOUT);
        expect(heartBeat.getBeatInterval()).to.eql(DEFAULT.INTERVAL);
    });
});
