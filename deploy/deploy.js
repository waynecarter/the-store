import fs from 'fs';
import http from 'http';
import path from 'path';

// Read in the deployment config.
const config = JSON.parse(fs.readFileSync(
    new URL('deploy.json', import.meta.url)
));
const gateway = config.gateway;
const include = config.include;

async function get(path, silent) {
    return send('GET', path, null, null, silent || false);
}

async function put(path, body, contentType) {
    return send('PUT', path, body, contentType, false);
}

async function post(path, body, contentType, silent) {
    return send('POST', path, body, contentType, silent || false);
}

async function del(path) {
    return send('DELETE', path, null, null, false);
}

class ContentType {
    static json = 'application/json';
    static javascript = 'application/javascript';
}

async function send(method, path, body, contentType, silent) {
    if (contentType == ContentType.json) {
        body = JSON.stringify(body, null, 2);
    }

    const options = {
        host: gateway.host,
        port: 4985,
        path: '/' + gateway.database.name + path,
        method: method,
        headers: {}
    };

    if (contentType != null) {
        options.headers['Content-Type'] = contentType;
    }

    if (body != null) {
        options.headers['Content-Length'] = body.length;
    }

    var request;
    let promise = new Promise((resolve, reject) => {
        request = http.request(options, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
                chunks.push(chunk);
            });

            response.on('end', () => {
                resolve({
                    httpVersion: response.httpVersion,
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    headers: response.headers,
                    body: Buffer.concat(chunks).toString(),
                    request: {
                        headers: request.getHeaders()
                    }
                });
            });

            response.on('error', (error) => {
                reject({
                    httpVersion: response.httpVersion,
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    headers: response.headers,
                    body: Buffer.concat(chunks).toString(),
                    request: {
                        headers: request.getHeaders()
                    },
                    error: error
                });
            });
        });

        // Send the request.
        if (body != null) {
            request.write(body);
        }
        request.end();
            
        request.on('information', (info) => {
            console.log(JSON.stringify(info, null, 2));
        });
    });

    // Use a buffered logger so that logging for requests/responses are
    // logged all at onces. This creates a better UX in some consoles.
    const bufferedLogger = {
        output: '',
        log(output) { this.output += output + '\n'; },
        flush() {
            const output = this.output;
            this.output = '';
            return output;
        }
    }

    // Log the request.
    if (silent != true) {
        console.log(`-- ${path} --------------------`);
        bufferedLogger.log('');
        bufferedLogger.log(`${options.method} http://${options.host}:${options.port}${options.path} HTTP/1.1`);
        const headers = request.getHeaders();
        Object.keys(headers).forEach(key => {
            bufferedLogger.log(`${key.toUpperCase()}: ${headers[key]}`);
        });
        if (body != null) {
            bufferedLogger.log(`\n${body}`);
        }
        console.log(bufferedLogger.flush());
    }

    const response = await promise;

    // Log the response.
    if (silent != true) {
        function log(output) {
            const statusCode = response.statusCode;
            if (statusCode >= 100 && statusCode <= 199) {
                console.info(output);
            } else if (statusCode >= 400 && statusCode <= 499) {
                console.error(output);
            } else if (statusCode >= 500 && statusCode <= 599) {
                console.error(output);
            } else {
                console.log(output);
            }
        }
        bufferedLogger.log('');
        bufferedLogger.log(`HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage}`);
        Object.keys(response.headers).forEach(key => {
            bufferedLogger.log(`${key.toUpperCase()}: ${response.headers[key]}`);
        });
        if (response.body.length > 0) {
            bufferedLogger.log(`\n${response.body}`);
        }
        log(bufferedLogger.flush());
    }

    return response;
}

// Database
if (include.database) { await deployDatabaseConfig(); }
async function deployDatabaseConfig() {
    // Read config.
    const localConfig = {
        name: gateway.database.name,
        bucket: gateway.database.bucket,
        num_index_replicas: 0,
        enable_shared_bucket_access: true
    };
    
    // Deploy.
    var remoteConfig = await get('/', true /* silent */);
    if (remoteConfig.statusCode == 404 /* Not Found */) {
        // If the config doesn't exist, create it.
        await put('/', localConfig, ContentType.json);
    } else {
        remoteConfig = await get('/_config', true /* silent */);
        remoteConfig = JSON.parse(remoteConfig.body);
        const configChanged = (
            remoteConfig.name !== localConfig.name
            || remoteConfig.bucket != localConfig.bucket
            || remoteConfig.num_index_replicas != localConfig.num_index_replicas
        )
        if (configChanged) {
            // If the config has changed, update it.
            await put('/_config', localConfig, ContentType.json);
        }
    }
}

// Users
if (include.users) { await deployUsersConfig(); }
async function deployUsersConfig() {
    var users = {};

    // Read config.
    const usersDir = new URL('../gateway/users/', import.meta.url);
    fs.readdirSync(usersDir, { withFileTypes: true })
        .filter(dirent => path.parse(dirent.name).ext == '.json')
        .map(dirent => dirent.name)
        .forEach( function(userFileName) {
            const userFile = new URL(userFileName, usersDir);
            if (fs.existsSync(userFile)) {
                const userName = path.parse(userFileName).name;
                users[userName] = JSON.parse(fs.readFileSync(userFile));
            }
        }
    );

    // Deploy.
    for (const user of Object.keys(users)) {
        await put(`/_user/${user}`, users[user], ContentType.json);
    }
}

// Roles
if (include.roles) { await deployRolesConfig(); }
async function deployRolesConfig() {
    var roles = {};

    // Read config.
    const rolesDir = new URL('../gateway/roles/', import.meta.url);
    fs.readdirSync(rolesDir, { withFileTypes: true })
        .filter(dirent => path.parse(dirent.name).ext == '.json')
        .map(dirent => dirent.name)
        .forEach( function(roleFileName) {
            const roleFile = new URL(roleFileName, rolesDir);
            if (fs.existsSync(roleFile)) {
                const roleName = path.parse(roleFileName).name;
                roles[roleName] = JSON.parse(fs.readFileSync(roleFile));
            }
        }
    );

    // Deploy.
    for (const role of Object.keys(roles)) {
        await put(`/_role/${role}`, roles[role], ContentType.json);
    }
}

// Sync
if (include.sync) { await deploySyncConfig(); }
async function deploySyncConfig() {
    // Read the sync config from file.
    const localConfig = String(fs.readFileSync(
        new URL('../gateway/sync.js', import.meta.url)
    ));

    // Determine if the config has changed.
    const remoteConfig = await get('/_config/sync', true /* silent */);
    const configChanged = remoteConfig.statusCode == 200 ? remoteConfig.body != localConfig : true;

    // If the config changed, update it.
    if (configChanged) {
        await put('/_config/sync', localConfig, ContentType.javascript);
    }

    // Resync if it is included and the sync function config has changed.
    if (include.resync, configChanged) {
        // Take the database offline.
        await post('/_offline');

        // Kick off resync.
        await post('/_resync');

        async function bringOnline() {
            const onlineResponse = await post('/_online', null, null, true /* silent */);
            return onlineResponse.statusCode == 200
        }

        async function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        // Wait untile we are able to bring the database back online
        // after resync finishes.
        while (await bringOnline() == false) {
            await sleep(1000);
        }
    }
}

// Functions
if (include.functions) { await deployFunctionsConfig(); }
async function deployFunctionsConfig() {
    var functions = {};

    // Read config.
    const functionsDir = new URL('../gateway/functions/', import.meta.url);
    const functionNames = fs.readdirSync(functionsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    for (const functionName of functionNames) {
        const functionDir = new URL(`${functionName}/`, functionsDir);
        
        // Read config.
        const config = (function() {
            const file = new URL('config.json', functionDir);
            if (fs.existsSync(file)) {
                return JSON.parse(fs.readFileSync(file));
            }
            return null;
        })();

        // Read code.
        var code = (function() {
            if (config != null) {
                const file = (function() {
                    switch (config.type) {
                        case 'javascript': return new URL('code.js', functionDir);
                        case 'query': return new URL('code.sql', functionDir);
                        default: return null;
                    }
                })();
                
                if (fs.existsSync(file)) {
                    return String(fs.readFileSync(file));
                }
            }
        })();

        // Include.
        if (config != null, code != null) {
            functions[functionName] = {
                type: config.type,
                parameters: config.args,
                allow: config.allow,
                code: code
            };
        }
    }

    // Deploy
    if (Object.keys(functions).length > 0) {
        await put('/_config/functions', functions, ContentType.json);
    }
}

// GraphQL
if (include.graghql) { await deployGraphQLConfig(); }
async function deployGraphQLConfig() {
    var graghql = {}
    
    // Read schema.
    const graphqlDir = new URL('../gateway/graphql/', import.meta.url);
    const schemaFile = new URL('schema.graphql', graphqlDir);
    if (fs.existsSync(schemaFile)) {
        graghql.schema = String(fs.readFileSync(schemaFile));
    }

    // Read resolvers.
    const resolversDir = new URL(`resolvers/`, graphqlDir);
    const typeNames = fs.readdirSync(resolversDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    for (const typeName of typeNames) {
        const typeDir = new URL(`${typeName}/`, resolversDir);

        const resolverFileNames = fs.readdirSync(typeDir, { withFileTypes: true })
            .filter(dirent => path.parse(dirent.name).ext == '.js')
            .map(dirent => dirent.name);
        for (const resolverFileName of resolverFileNames) {
            const resolverFile = new URL(resolverFileName, typeDir);

            // Include in deployment.
            if (fs.existsSync(resolverFile)) {
                if (graghql.resolvers == null) {
                    graghql.resolvers = {};
                }

                if (graghql.resolvers[typeName] == null) {
                    graghql.resolvers[typeName] = {};
                }

                const resolverName = path.parse(resolverFileName).name;
                const code = String(fs.readFileSync(resolverFile));
                graghql.resolvers[typeName][resolverName] = code;
            }
        }
    }

    // Deploy.
    if (graghql.schema != null, graghql.resolvers != null) {
        await put('/_config/graphql', graghql, ContentType.json);
    }
}