

const webSite = 'https://missav.ws/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36';
let cookie = '';


//获取影视列表
async function categoryContent(tid, pg = 1, extend) {
    let backData = new RepVideo();
    try {
        let listUrl =webSite+ '/vodtype/'+tid+'-'+ pg+'.html';
        let pro = await req(listUrl, {
            method: 'GET',
            headers: {
                'User-Agent': UA,
            },
        });
        let proData = await pro.text();
        const $ = cheerio.load(proData);
        let allVideo = $('.stui-vodlist__box');
        let videos = [];
        allVideo.each((_, e) => {
            let vodUrl = $(e).find('a').attr('href');
            if (vodUrl.includes('/vodplay/')) {
                let vodPic = $(e).find('a').attr('data-original');
                let vodName = $(e).find('a').attr('title');
                let remarks = $(e).find('.pic-text.text-right').text();
                let videoDet = new VideoList();
                videoDet.vod_id = vodUrl+"||"+vodPic+"||"+vodName;
                videoDet.vod_pic = vodPic;
                videoDet.vod_name = vodName;
                videoDet.vod_remarks = remarks;
                videos.push(videoDet);
            }
        })
        backData.list = videos;
    } catch (error) {
        console.error('Error in fetchData:', error);
        backData.msg = error.statusText;
    }
    console.log(JSON.stringify(backData));
    return JSON.stringify(backData);
}

//获取影视详情信息
async function detailContent(ids) {
    let backData = new RepVideo();
    let parts = ids.split('||');
    const webUrl = webSite +parts[0];
    try {
        let pro = await req(webUrl, {
            method: 'GET',
            headers: {
                'User-Agent': UA,
            },
        });
        let proData = await pro.text();
        let vod_content = '';
        let vod_pic = parts[1];
        let vod_name = parts[2];
        let vod_year = '';
        let vod_director = '';
        let vod_actor = '';
        let vod_area = '';
        let vod_play_from = '播放列表';
        let vod_play_url = '正片$'+文本_取中间(文本_取中间(proData,'var player_aaaa=','</script>'),'"url":"','"').replace(/\\/g, '');
        let detModel = new VideoDetail();
        let videos = [];
        detModel.vod_year = vod_year;
        detModel.vod_director = vod_director;
        detModel.vod_actor = vod_actor;
        detModel.vod_area = vod_area;
        detModel.vod_content = vod_content.replace(/\s+/g, '');
        detModel.vod_pic = vod_pic;
        detModel.vod_name = vod_name;
        detModel.vod_play_from = vod_play_from;
        detModel.vod_play_url = vod_play_url;
        detModel.vod_id = ids;
        videos.push(detModel);
        backData.list = videos;
    } catch (error) {
        console.error('Error in fetchData:', error);
        backData.msg = error.statusText;
    }
    console.log(JSON.stringify(backData));
    return JSON.stringify(backData);
}

//获取首页分类
async function homeContent() {
    let backData = new RepVideo();
    try {
        let list = [];
        let allClass = [
            {
                type_id: 'dm514',
                type_name: '最近更新',
            },
            {
                type_id: 'dm562',
                type_name: '新作上市',
            },
            {
                type_id: 'dm620',
                type_name: '無碼流出',
            },
            {
                type_id: 'dm96',
                type_name: '無碼FC2',
            },
            {
                type_id: 'dm256',
                type_name: '本月熱門',
            },
            {
                type_id: 'dm34',
                type_name: '麻豆傳媒',
            },
            {
                type_id: 'dm265',
                type_name: '中文字幕',
            },
            {
                type_id: 'dm291',
                type_name: '今日熱門',
            },
            {
                type_id: 'dm5045',
                type_name: '無碼HEYZO',
            },
            {
                type_id: 'dm169',
                type_name: '本週熱門',
            },
            {
                type_id: 'dm23',
                type_name: '素人S-CUTE',
            }
        ];
        allClass.forEach((e) => {
            let videoClass = new VideoClass()
            videoClass.type_id = e.type_id
            videoClass.type_name = e.type_name
            list.push(videoClass)
        });
        backData.class = list;
    } catch (error) {
        //console.error('Error in fetchData:', error);
        backData.msg = error.statusText;
    }
    console.log(JSON.stringify(backData));
    return JSON.stringify(backData);
}

//解析获取播放地址
async function playerContent(vod_id) {
    let backData = new RepVideoPlayUrl();
    backData.url = vod_id;
    backData.playUrl='';
    backData.parse = 1;
    backData.header = '';
    //console.log(JSON.stringify(backData));
    return JSON.stringify(backData);
}

async function searchContent(keyword) {
    let backData = new RepVideo();
    try {

        let url = webSite + `/vodsearch/-------------.html?wd=${keyword}&submit=`
        //console.log(url);
        let pro = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': UA,
            },
        });
        let proData = await pro.text();
        let $ = cheerio.load(proData);
        let allVideo = $('.stui-vodlist__box');
        let videos = [];
        allVideo.each((_, e) => {
            let url = $(e).find('a').attr('href');
            let name = $(e).find('a').attr('title');
            let pic = $(e).find('a').attr('data-original');
            let subTitle =$(e).find('.pic-text.text-right').text();
            let videoDet = new VideoList();
            videoDet.vod_id = url  + "||"+pic+"||"+ name;
            videoDet.vod_pic = pic;
            videoDet.vod_name = name;
            videoDet.vod_remarks = subTitle;
            videos.push(videoDet);
        })
        backData.list = videos;
    } catch (error) {
        console.error('Error in fetchData:', error);
        backData.msg = error.statusText;
    }
    console.log(JSON.stringify(backData));
    return JSON.stringify(backData);
}
