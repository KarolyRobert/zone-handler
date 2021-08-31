import child_process from 'child_process';
import nsupdate from '../src/util/nsupdate';

jest.mock('child_process');

const updateCommand =  'zone hobbyfork.com\n'+
'key hmac-sha256:update.key asdfksf8s6s875g765\n'+
'update delete www.hobbyfork.com. 30 A 37.234.91.82\n'+
'update add home.hobbyfork.com. 21600 A 192.168.1.6\n'+
'send\n'

describe('nsupdate',() => {

    test('nsupdate call child_process.spawn with given parameters.',() => {
        expect.assertions(3);
        nsupdate(updateCommand);
        expect(child_process.spawn.mock.calls.length).toBe(1);
        expect(child_process.spawn.mock.calls[0][0]).toBe('nsupdate');
        expect(child_process.spawn.mock.calls[0][1]).toEqual(['-v']);
    });

    test('nsupdate reject if bindutils/nsupdate not in running environment.',() => {
        expect.assertions(1);
        nsupdate(updateCommand).catch(err => {
            expect(err).toBe('nsupdate error');
        });
        child_process._current.emit('error',new Error('nsupdate error'));
    });

    test('nsupdate reject on runtime error',done => {
        expect.assertions(1);
        let error;
            nsupdate(updateCommand).catch(err => {
                error = err;
                //expect(err).toBe('dig runtime error');
            });
        child_process._current.stderr.push('nsupdate runtime error');
        setTimeout(() => {
            expect(error).toBe('nsupdate runtime error');
            done();
        },100);
    });

    test('nsupdate reject on close not null exit code',() => {
        expect.assertions(1);
        nsupdate(updateCommand).catch(err => {
            expect(err).toBe('nsupdate exit with -1');
        });
        child_process._current.emit('close',-1);
    });

    test('nsupdate resolve on close code 0 with proper result',done => {
        expect.assertions(2);
        let result;
        nsupdate(updateCommand).then(res => {
            result = res;
        });
        
        process.nextTick(() => child_process._current.emit('close',0));
        setTimeout(() => {
            expect(result).toBe('');
            expect(child_process._current.stdin.buffer).toMatchSnapshot();
            done();
        },100);
    });

});