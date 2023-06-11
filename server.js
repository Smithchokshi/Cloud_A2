const path = require('path')
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const AWS = require('aws-sdk');


const PORT = 50051;
const protofile = './proto/computeandstorage.proto';

const credentials = new AWS.Credentials({
    accessKeyId: "ASIA6DHIQVMZQWF4NQNC",
    secretAccessKey: "9bgFozthrThg/5lBR1ZkDD2x8thpxkFzc5xhfLrB",
    sessionToken: "FwoGZXIvYXdzEHwaDBl/YpEf7ulBbwdVcyLAAXTazQVxOTsF6MfcMiHYPdA+Yu4ExaFRsfaWyEqyQB/ClLHRrchnm2ghxLHEWfyV/n35iLMOoJGRsSRhdSwTwDd3Q/pYu5F0B1hGt2a1mN7+lo7004NkfwlGStdGqgzmNzUkPTddd2XzPgxI5YwL3nMgjNDmBQ7NU3Yr01YE1cLKG8qwuvwmPHQqpBXG35XXXcDR2FIdIvPdxLFTViz6/JRXyL0RqzWxRBNFWzTgcYbHKKeX0tJ6neV14EA0XZgYTiip5pSkBjItSk4uACLGAdQAVFAai7CsPqNm+/NXlCOD9/HjyiIVQdpgOKAKqYsjWLKZF3Xn"
})

const s3 = new AWS.S3({ credentials });
const bucketName = "csci5409-a2-b00923763"


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

const handleStoreData = (resData) => {
    try {
        const fileName = 'file.txt';
        let url = '';

        s3.getObject({ Bucket: bucketName, Key: fileName }, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const uploadParams = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: Buffer.from(`${resData}`, 'utf-8')
                };

                s3.putObject(uploadParams, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Data added to the file successfully');
                        url = 'https://csci5409-a2-b00923763.s3.amazonaws.com/file.txt';
                    }
                });
            }
        });
        return url;

    } catch (e) {
        console.log(e)
    }
}

function getServer() {
    const server = new grpc.Server();
    server.addService(computeandstorage.EC2Operations.service, {
        "StoreData": (req, res) => {
            const url = handleStoreData(req.request.data);
            const response = {
                s3uri: url
            }
            res(null, response);
        },
        "AppendData": (req, res) => {
            console.log(req.request);
        },
        "DeleteFile": () => {

        }
    })

    return server;
}

main()