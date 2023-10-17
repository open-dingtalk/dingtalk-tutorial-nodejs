import {DWClient, DWClientDownStream, EventAck} from 'dingtalk-stream';
const { program } = require('commander');

program
    .requiredOption('--clientId <Client ID>', 'your client id, AppKey or SuiteKey')
    .requiredOption('--clientSecret <Client Secret>', 'your client secret, AppSecret or SuiteSecret')
    .parse();
const options = program.opts();

const client = new DWClient({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
});

const onEventReceived = (event: DWClientDownStream) => {
  if (event.headers?.eventType !== 'chat_update_title') {
    // ignore events not equals `chat_update_title`; 忽略`chat_update_title`之外的其他事件；
    // 该示例仅演示 chat_update_title 类型的事件订阅；
    return {status: EventAck.SUCCESS};
  }
  const now = new Date();
  console.log(`received event, 
  delay=${now.getTime() - parseInt(event.headers?.eventBornTime || '0')}ms, 
  eventType=${event.headers?.eventType}, 
  eventId=${event.headers?.eventId}, 
  eventBornTime=${event.headers?.eventBornTime},  
  eventCorpId=${event.headers?.eventCorpId},
  eventUnifiedAppId=${event.headers?.eventUnifiedAppId}, 
  data=${event.data}`)
  return {status: EventAck.SUCCESS, message: 'OK'}; // message 属性可以是任意字符串；
}

client
    .registerAllEventListener(onEventReceived)
    .connect();