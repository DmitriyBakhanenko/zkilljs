'use strict';

async function f(app) {
    if (await app.redis.get("zkb:no_parsing") == "true") return;
    return;
    
    let res, json, min_id = 9999999999;
    do {
    	if (app.bailing) throw 'fetch_wars.js bailing';
        let url = app.esi + '/v1/wars/' + (min_id == 9999999999 ? '' : '?max_war_id=' + min_id);
        res = await app.phin(url);
        if (res.statusCode == 200) {
            json = JSON.parse(res.body);

            for (let war_id of json) {
                if (app.bailing) throw 'fetch_wars.js bailing';
                min_id = Math.min(min_id, war_id);
                if (await app.db.information.countDocuments({
                        type: 'war_id',
                        id: war_id
                    }) == 0) {
                    await app.util.entity.add(app, 'war_id', war_id, false);
                }
            }
        } else json = [];
        await app.sleep(50);
    } while (json.length > 0 && min_id > 1);
}

module.exports = f;