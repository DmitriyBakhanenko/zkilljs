var express = require('express');
var router = express.Router({strict: true});
module.exports = router;

// Overview
addGet('/site/information/:type/:id.html', 'site/information.js', 'information.pug');
addGet('/site/killmails/:type/:id.html', 'site/kill-list.js', 'kill-list.pug');
addGet('/site/killmail/row/:id.html', 'site/killmail-row.js', 'killmail-row.pug');


addGet('/cache/1hour/api/information/:type/:id/:field.html', 'site/information', 'raw.pug');

addGet('/api/1hour/information/:type/:id.json', 'api/information.js');
addGet('/api/1hour/killmail/:id.json', 'api/killmail.js');
addGet('/api/1hour/statistics/:type/:id.json', 'api/statistics.js');
addGet('/api/1hour/killmails/recent/:type/:id.json', 'api/killmails.js');
addGet('/api/1hour/killmails/:date/:type/:id.json', 'api/killmails-daily.js');

router.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

async function doStuff(req, res, next, controllerFile, pugFile) {
    try {
        const file = res.app.root + '/www/routes/' + controllerFile;
        const controller = require(file);

        let result = await controller(req, res);

        res.set('Cache-Control', 'public, max-age=' + (result.maxAge || 0));

        if (result === null || result === undefined) { 
            res.sendStatus(404);
        } else if (typeof result === "object") {
            if (pugFile !== undefined) res.render(pugFile, result);
            else if (result.json !== undefined) res.json(result.json);
        } else if (typeof result == "string") {
            res.redirect(result);
        }

    } catch (e) {
        console.log(e);
    }
}

function addGet(route, controllerFile, pugFile) {
    //if (pugFile == undefined) pugFile = controllerFile;
    router.get(route, (req, res, next) => {
        doStuff(req, res, next, controllerFile, pugFile);
    });
}