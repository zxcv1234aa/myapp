/**
 * GitMind 解锁VIP，解除文件限制，修改过期时间
 * ⚠️仅供学习参考，请支持正版。
[rewrite_local]
# 匹配 GitMind 及傲软系列通用接口
^https:\/\/aw\.aoscdn\.com\/(base\/vip\/v2\/vips|app\/gitmind\/v3\/user) url script-response-body https://raw.githubusercontent.com/zxcv1234aa/myapp/main/gitmind.js

[mitm]
hostname = aw.aoscdn.com
 * 
 */



var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);

// 定义要修改的 VIP 数据常量
const vipInfo = {
    "license_type": "premium",
    "license_type_id": 1,
    "status": 1,
    "is_vip": 1,
    "vip_special": 1,
    "expired_at": 4092600296, // 2099年
    "expire_time": "2099-09-09 09:09:09",
    "limit": 0, // 0通常代表无限制
    "quota": 9999999,
    "limit_quota": 9999999
};

// 匹配接口 1: 通用 VIP 状态 (/base/vip/v2/vips)
if (url.indexOf("/base/vip/v2/vips") != -1) {
    if (obj.data) {
        // 强制修改为高级版
        obj.data.license_type = vipInfo.license_type;
        obj.data.status = vipInfo.status;
        obj.data.vip_special = vipInfo.vip_special;
        
        // 修改过期时间
        obj.data.expired_at = vipInfo.expired_at;
        obj.data.limit_expired_at = vipInfo.expired_at;
        
        // 修改配额限制
        obj.data.limit = vipInfo.limit; 
        obj.data.quota = vipInfo.quota;
        obj.data.ai_quota = 99999; // 增加AI配额
    }
}

// 匹配接口 2: GitMind 用户信息 (/app/gitmind/v3/user)
if (url.indexOf("/app/gitmind/v3/user") != -1) {
    if (obj.data) {
        // 身份标识
        obj.data.license_type = vipInfo.license_type;
        obj.data.passport_license_type = vipInfo.license_type;
        obj.data.is_vip = vipInfo.is_vip;
        
        // 时间控制
        obj.data.expired_at = vipInfo.expired_at;
        obj.data.expire_time = vipInfo.expire_time;
        
        // 解除具体功能限制 (根据抓包中的字段)
        obj.data.file_limit = 99999;       // 文件数量限制
        obj.data.file_num = 0;             // 已用文件数(可选，视觉效果)
        obj.data.flow_num = 0;             // 流程图数量
        obj.data.planet_max = 999;         // 星球最大数量
        obj.data.planet_member_max = 999;  // 星球成员最大数量
        obj.data.space_limit = 10737418240; // 空间限制改大 (10GB)
        obj.data.limit_quota = vipInfo.limit_quota;
    }
}

$done({body: JSON.stringify(obj)});
