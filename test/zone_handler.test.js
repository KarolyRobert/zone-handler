import zone_handler from '../src/zone_handler';
import { getAuthoritative } from '../src/util/utils';
import dns_zone from '../src/dns_zone';


jest.mock('../src/util/utils',() => {
    return{
        getAuthoritative:jest.fn(() => {
            return new Promise(resolve => resolve({zone:'hobbyfork.com',server:'ns0.hobbyfork.com'}));
        })
    }
});

jest.mock('../src/dns_zone',() => {
    return {
        __esModule: true,
        default:jest.fn(() => {
            return new Promise(resolve => resolve());
        })
    }
});


describe('zone_handler', () => {

    test('zone_handler without parameter must return a promise rejection with some development advices.',() => {
        return expect(zone_handler()).rejects.toBe('zone_handler expect an object parameter with zone,updateKey,transferKey fields!');
    });

    describe('zone_handler must supplement its own parameter with the authoritative name server belonging to the given zone',() => {

        test('without updateKey and transferKey fields resolves to that authoritative name server',() => {
            expect.assertions(3);
            zone_handler({zone:'hobbyfork.com'}).then(result => {
                expect(result).toStrictEqual({zone:'hobbyfork.com',server:'ns0.hobbyfork.com'});
                expect(getAuthoritative.mock.calls.length).toBe(1);
                expect(getAuthoritative.mock.calls[0][0]).toBe('hobbyfork.com');
            });
        });

        test('zone_handler with request containing transferKey supplement request and call dns_zone with supplemented request.', () => {
            zone_handler({zone:'valami.barmi.hobbyfork.com',transferKey:{name:'tsig',algorithm:'hmac-256',secret:'qwertzuiop'}}).then(() => {
                expect.assertions(2);
                expect(dns_zone.mock.calls.length).toBe(1);
                expect(dns_zone.mock.calls[0][0]).toStrictEqual({zone:'hobbyfork.com',server:'ns0.hobbyfork.com',transferKey:{name:'tsig',algorithm:'hmac-256',secret:'qwertzuiop'},updateKey:false});
            });
        });

    });
   
});
