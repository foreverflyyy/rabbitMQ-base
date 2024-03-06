const fs = require('fs');
// const service = require('../../../serviceConfig/api.service');
const redisService = require('../../../serviceConfig/redis');
const rabbitService = require('../../../serviceConfig/rabbitMq');

const workers = ['list.js', 'item.js', 'purge.js', 'delete.js', 'put.js', 'post.js'];

const getModules = () => {
    let modules = {}
    let struct = fs.readdirSync(__dirname)
    struct.filter((mod) => {
        return !mod.includes('.js')
    }).map((mod) => {
        modules[mod] = {}
        let subs = fs.readdirSync(__dirname+'/'+mod)
        subs.filter(f => {
            return workers.indexOf(f) > -1
        }).map(f => {
            modules[mod][f.split('.')[0]] = require(__dirname+'/'+mod+'/'+f)
        })
    })
    return modules
}

let modules = getModules()
module.exports = async (req, res, next) => {
    if(req.params.id && req.params.id.length > 20 && !req.params.id.includes('-')) { req.params.id = global._getObjectId(req.params.id) }
    switch (req.method) {
        case 'DELETE':
        case 'PUT':
        case 'PURGE':
            if(req.params.collection && req.params.id) {
                if(modules[req.params.collection] && modules[req.params.collection][req.method.toLowerCase()]) {
                    let response = await modules[req.params.collection][req.method.toLowerCase()](req, rabbitService, redisService)
                    res.json(response)
                } else {
                    next()
                }
            } else {
                next()
            }
            break
        case 'POST':
            if(modules[req.params.collection] && modules[req.params.collection].post) {
                let response = await modules[req.params.collection].post(req, rabbitService, redisService)
                res.json(response)
            } else {
                next()
            }
            break
        default:
            if(req.params.collection && req.params.id) {
                if(modules[req.params.collection] && modules[req.params.collection].item) {
                    let response = await modules[req.params.collection].item(req, rabbitService, redisService)
                    res.json(response)
                } else {
                    next()
                }
            } else if(req.params.collection) {
                if(modules[req.params.collection] && modules[req.params.collection].list) {
                    let response = await modules[req.params.collection].list(req, rabbitService, redisService)
                    if (response.csv){
                        let csv = response.csv
                        let name = response.name ? response.name : 'custom_name'
                        res.writeHead(200, {
                            'Content-Type': 'text/csv',
                            'Content-Disposition': 'attachment; filename=*'+name+'*.csv'
                        });
                        res.end(csv);
                    } else {
                        res.json(response)
                    }

                } else {
                    next()
                }
            } else {
                next()
            }
    }
}
