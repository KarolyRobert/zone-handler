import child_process from 'child_process';
import dig from '../src/util/dig';

jest.mock('child_process');


describe('dig',() => {

    test('dig call child_process.spawn with given parameters.',() => {
        expect.assertions(3);
        dig(['param1','param2']);
        expect(child_process.spawn.mock.calls.length).toBe(1);
        expect(child_process.spawn.mock.calls[0][0]).toBe('dig');
        expect(child_process.spawn.mock.calls[0][1]).toEqual(['param1','param2']);
    });

    test('dig reject if bindutils/dig not in running environment.',() => {
        expect.assertions(1);
        dig(['param1','param2']).catch(err => {
            expect(err).toBe('dig error');
        });
        child_process._current.emit('error',new Error('dig error'));
    });

    test('dig reject on runtime error',done => {
        expect.assertions(1);
        let error;
            dig(['param1','param2']).catch(err => {
                error = err;
                //expect(err).toBe('dig runtime error');
            });
        child_process._current.stderr.push('dig runtime error');
        setTimeout(() => {
            expect(error).toBe('dig runtime error');
            done();
        },100);
    });

    test('dig reject on close not null exit code',() => {
        expect.assertions(1);
        dig(['param1','param2']).catch(err => {
            expect(err).toBe('dig exit with -1');
        });
        child_process._current.emit('close',-1);
    });

    test('dig resolve on close code 0 with proper result',done => {
        expect.assertions(1);
        let result;
        dig(['param1','param2']).then(res => {
            result = res;
        });
        child_process._current.stdout.push('line 1\n');
        child_process._current.stdout.push('line 2\n');
        child_process._current.stdout.push('line 3\n');
        process.nextTick(() => child_process._current.emit('close',0));
        setTimeout(() => {
            expect(result).toBe('line 1\nline 2\nline 3\n');
            done();
        },100);
    });

});