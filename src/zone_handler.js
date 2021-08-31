
import dns_zone from './dns_zone';
import { getAuthoritative } from './util/utils';


export default function zone_handler(req){
    let request = Object.assign({
        zone:false,
        server:false,
        updateKey:false,
        transferKey:false
    },req);

    return new Promise((resolve,reject) => {
        if(request.zone){
            getAuthoritative(request.zone).then(authoritative => {
                if(request.transferKey){
                    request = Object.assign(request,authoritative);
                    dns_zone(request).then(zone => {
                      
                        resolve(zone);

                    },err => reject(err));
                }else{
                    resolve(authoritative);
                }
            },err => reject(err));
        }else{
            reject('zone_handler expect an object parameter with zone,updateKey,transferKey fields!');
        }
    });
}
