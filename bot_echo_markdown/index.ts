import {DWClient, DWClientDownStream, EventAck, TOPIC_ROBOT} from 'dingtalk-stream';
const { program } = require('commander');
const https = require('node:https');

program
    .requiredOption('--clientId <Client ID>', 'your client id, AppKey or SuiteKey')
    .requiredOption('--clientSecret <Client Secret>', 'your client secret, AppSecret or SuiteSecret')
    .parse();
const options = program.opts();

const client = new DWClient({
    clientId: options.clientId,
    clientSecret: options.clientSecret,
});

const onBotMessage = (event: DWClientDownStream) => {
    let message = JSON.parse(event.data);
    let content = (message?.text?.content || '').trim();
    let webhook = message?.sessionWebhook || '';
    let text = 'echo received message:\n' +
        content.split('\n').map((item: string) => {
            return '>1. ' + item.trim();
        }).join('\n');

    // 回复消息
    const data = JSON.stringify({
        'msgtype': 'markdown',
        'markdown': {
            'title': 'dingtalk-tutorial-java',
            'text': text,
        },
        'at': {
            'atUserIds': [message?.senderStaffId || '']
        }
    })
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    const req = https.request(webhook, options, (res: any) => {
        console.log(`状态码: ${res.statusCode}`)
        res.on('data', (d: any) => {
            console.log('data:', d)
        })
    });
    req.on('error', (error: any) => {
        console.error(error);
    })
    req.write(data);
    req.end();
    return {status: EventAck.SUCCESS, message: 'OK'}; // message 属性可以是任意字符串；
}

client
    .registerCallbackListener(TOPIC_ROBOT, onBotMessage)
    .connect();