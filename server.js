const path = require('path')
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PORT = 8082;
const protofile = './proto/computeandstorage.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, protofile), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const grpcObj = (grpc.loadPackageDefinition(packageDef))

const computeandstorage = grpcObj.computeandstorage;

function main() {
    const server = getServer()

    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(),
        (err,port) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Server running at ${PORT}`)
            server.start();
        }
        })
}

function getServer() {
    const server = new grpc.Server();
    server.addService(computeandstorage.EC2Operations.service, {
        "StoreData": (req, res) => {
            console.log(req, res);
        },
        "AppendData": () => {

        },
        "DeleteFile": () => {

        }
    })

    return server;
}

main()