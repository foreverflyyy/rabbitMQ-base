const {nanoid} = require("nanoid");
const {set: setValueToRedis} = require("../../../../serviceConfig/redis");
const {
    getAndCreateChannel,
    sendMessageToQueue,
    sendMessageToExchange
} = require("../../../../serviceConfig/rabbitMq");

const mainQueueName = 'send-now-letter';
const exchangeName = "letters";
const exchangeType = "x-delayed-message";
const recipientName = "delivery";

module.exports = async (req) => {
    let {data} = req.body;
    if(!data) {
        return {success: false, data: "Переданы не все данные."};
    }

    const vhostName = "sending_letter";
    const channel = await getAndCreateChannel(vhostName);

    const id = nanoid();
    await setValueToRedis(id, data);

    await sendMessageToQueue({
        channel,
        queueName: mainQueueName,
        message: {id}
    });

    await sendMessageToExchange({
        channel,
        exchangeName,
        exchangeType,
        message: {id},
        routerKey: recipientName,
        createOptions: { arguments: {'x-delayed-type':  "direct"} },
        sendOptions: {headers: {"x-delay": 7 * 1000}}
    });

    return {success: true, data: "Успешная отправка запроса."};
}

const letter = `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial scale=1.0" />
                <meta http-equiv="Content-Type" content="text/html">
                <meta charset="utf-8">
                <title></title>
                <style type="text/css">
                    * {
                        padding: 0;
                        margin: 0;
                        border: 0;
                    }
    
                    *,
                    *:before,
                    *:after {
                        -moz-box-sizing: border-box;
                        -webkit-box-sizing: border-box;
                        box-sizing: border-box;
                    }
    
                    :focus,
                    :active {
                        outline: none;
                    }
    
                    a:focus,
                    a:active {
                        outline: none;
                    }
    
                    nav,
                    footer,
                    header,
                    aside {
                        display: block;
                    }
    
                    html {
                        height: 100%;
                    }
    
                    body {
                        height: 100%;
                        width: 100%;
                        font-size: 100%;
                        line-height: 1;
                        font-size: 14px;
                        -ms-text-size-adjust: 100%;
                        -moz-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                    }
    
                    input,
                    button,
                    textarea {
                        font-family: inherit;
                    }
    
                    input::-ms-clear {
                        display: none;
                    }
    
                    button {
                        cursor: pointer;
                        background-color: transparent;
                    }
    
                    button::-moz-focus-inner {
                        padding: 0;
                        border: 0;
                    }
    
                    a,
                    a:visited {
                        text-decoration: none;
                    }
    
                    a:hover {
                        text-decoration: none;
                    }
    
                    ul li {
                        list-style: none;
                    }
    
                    img {
                        vertical-align: top;
                    }
    
                    h1,
                    h2,
                    h3,
                    h4,
                    h5,
                    h6 {
                        font-size: inherit;
                        font-weight: inherit;
                    }
    
                    .premier {
                        margin: 0;
                        font-style: normal;
                        font-family: Arial, Helvetica, sans-serif;
                    }
    
                    .premier__container {
                        width: 100%;
                        max-width: 1000px;
                        overflow: hidden;
                        background-color: #ffffff;
                        border-radius: 30.3px;
                        margin: 0 auto;
                        padding-bottom: 50px;
                    }
    
                    .title {
                        font-size: 35px;
                        font-style: normal;
                        font-weight: 700;
                        line-height: 48.485px;
                        margin-bottom: 60px;
                    }
    
                    .desc {
                        font-size: 25px;
                        font-style: normal;
                        font-weight: 500;
                        line-height: 48.485px;
                        margin-bottom: 60px;
                    }
    
                    .desc > span{
                        color:  #000;
                        font-size: 25px;
                        font-style: normal;
                        font-weight: 700;
                        line-height: 48.485px;
                        text-decoration-line: underline;
                    }
    
                    .table {
                        padding: 0 60px;
                    }
    
                    .btn {
                        font-size: 30.966px;
                        font-style: normal;
                        font-weight: 600;
                        line-height: 46.449px;
                    }
    
                    .code{
                        margin-right: 20px;
                        font-size: 13px;
                        font-style: normal;
                        font-weight: 500;
                        line-height: 18.485px;
                        margin-bottom: 30px;
                        padding: 0 60px;
                    }
    
                    @media screen and (max-width:500px) {
                        .title {
    
                            margin-right: 20px;
                            font-size: 24px;
                            line-height: 20.485px;
                            margin-bottom: 30px;
    
                        }
    
                        .desc {
                            margin-right: 20px;
                            font-size: 18px;
                            font-style: normal;
                            font-weight: 500;
                            line-height: 18.485px;
                            margin-bottom: 30px;
    
                        }
    
                        .table {
                            padding: 0 20px;
                        }
    
                        .btn {
                            font-size: 20.966px;
                            font-style: normal;
                            font-weight: 600;
                            line-height: 20.449px;
                        }
    
                        .code{
                            padding: 0 20px;
                            font-size: 12px;
                        }
                    }
    
                    .premier__banner {
                        display: block;
                    }
    
                    .premier__banner>td {
                        border-radius: 30.3px;
                        position: relative;
                        width: 100%;
    
                    }
                </style>
            </head>
            <body class="premier" cz-shortcut-listen="true" style="background: #F4F4F4;">
                <table class="premier__container" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                        <tr class="premier__banner">
                            <td>
                                <img src="bannerLink"
                                    alt="banner" width="100%" height="" border="0"
                                    style=" border-radius: 30.303px; border: 0; outline:none; text-decoration:none; display:block; margin-bottom: 60px;" />
                            </td>
                        </tr>
                        <tr>
                            <td valign='top' align='center'>
                                <span style="display: block; width: 100%; text-align: center; color:#000; " class="title">Успейте
                                    воспользоваться предложением vendorName</span>
                            </td>
                        </tr>
    
                        <tr>
                            <td valign='top' align='center'>
                                <span style="display: block; width: 100%; text-align: center; color:#000; " class="desc">
                                    по промокоду <span>code</span>
                                </span>
                            </td>
                        </tr>
                        <tr>
                                <td valign='top' align='center'>
                                    <span style="display: block; width: 100%; text-align: left; color: #B5B5B5; margin-bottom: 4px;" class="code">
                                    </span>
                                </td>
                            </tr>
                        <tr>
                            <td>
                                <table border='0' cellpadding='0' cellspacing='0'
                                    style='border-collapse: separate; width: 100%; box-sizing: border-box;'
                                    class="table">
                                    <tr>
                                        <td style='font-family: sans-serif; font-size: 14px; vertical-align: top; text-align: center;'
                                            valign='top' align='center'>
                                            <a href='activationLink' target="_blank" class="btn"
                                                style='display: inline-block; color: #ffffff; background-color:#F30745; border-radius: 16px; box-sizing: border-box; cursor: pointer; text-decoration: none;  margin: 0; padding: 20px; width: 100%;'>Получить подарок</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    `