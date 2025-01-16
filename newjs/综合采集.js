
const webSite = {
  "resources": [
    {
      "name": "影图资源", // 源名称
      "url": "https://cj.vodimg.top/api.php/provide/vod/",  // 源链接
      "filter_tags": ["演员"],   // 过滤分类
      "prepend_classes": ["国产剧", "港台剧"]  // 前置分类
    },
    {
      "name": "红牛资源",
      "url": "https://www.hongniuzy2.com/api.php/provide/vod/",
      "filter_tags": ["体育赛事", "电影", "连续剧"],
      "prepend_classes": ["国产剧", "港澳剧"]  // 前置分类
    },
    {
      "name": "量子资源",
      "url": "http://cj.lziapi.com/api.php/provide/vod/",
      "filter_tags": ["电影片", "连续剧", "综艺片", "动漫片"],
      "prepend_classes": ["国产剧", "香港剧"]  // 前置分类
    }
  ]
};





const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36',
}

//categoryContent("https://cj.vodimg.top/api.php/provide/vod/",2,JSON.stringify({class: '2'}));

async function categoryContent(tid, pg = 1, extend) {
  const backData = new RepVideo();
  try {
    // 当 extend 为空且 pg 大于 1 时，直接返回空 list
    if (!extend && pg > 1) {
      backData.list = [];
      console.log(JSON.stringify(backData));
      return JSON.stringify(backData);
    }

    // 构建初始 URL，确保参数正确衔接
    let url = `${tid}${tid.includes('?') ? '&' : '?'}ac=detail`;

    if (extend) {
      try {
        const extendParams = JSON.parse(extend);
        const { class: t } = extendParams;
        if (t) {
          // 判断是否需要使用 `&` 衔接
          url += url.includes('?') ? '&' : '?';
          url += `t=${t}`;
        }
      } catch (error) {
        console.error('Failed to parse extend:', error);
        throw new Error('Invalid extend parameter');
      }
    }

    if (pg > 1) {
      // 判断是否需要使用 `&` 衔接
      url += url.includes('?') ? '&' : '?';
      url += `pg=${pg}`;
    }

    const response = await req(url, { headers });
    const responseData = await response.json();

    // 提取需要的字段，并构建 vod_id 的完整 URL
    backData.list = responseData.list.map(item => {
      // 构建 vod_id 的 URL，确保参数正确衔接
      const vodIdUrl = `${tid}${tid.includes('?') ? '&' : '?'}ac=detail&ids=${item.vod_id}`;
      return {
        vod_id: vodIdUrl,
        vod_name: item.vod_name,
        vod_pic: item.vod_pic,
        vod_remarks: item.vod_remarks,
      };
    });
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.message;
  }

  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}


//detailContent('https://cj.vodimg.top/api.php/provide/vod/?ac=detail&ids=338617');

async function detailContent(ids) {
  const backData = new RepVideo();
  const detModel = new VideoDetail();
  try {
    const pro = await req(ids, {
      headers: headers,
    })
    const proData = await pro.json();
    console.log(proData);
    if (proData) {
      let obj = proData.list[0]
      detModel.vod_remarks = obj.vod_remarks
      detModel.vod_year = obj.vod_year
      detModel.vod_director = obj.vod_director
      detModel.vod_actor = obj.vod_actor
      detModel.vod_area = obj.vod_area
      detModel.vod_content = obj.vod_content
      detModel.vod_pic = obj.vod_pic
      detModel.vod_name = obj.vod_name
      detModel.vod_play_from = obj.vod_play_from
      detModel.vod_play_url = obj.vod_play_url
      detModel.vod_id = ids
      backData.list.push(detModel);
    }
  } catch (error) {
    console.error('Error in detailContent:', error);
    backData.msg = error.statusText || error.message;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

async function fetchData(url) {
  try {
    const response = await req(url,{
      method: 'GET',
      headers: headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch data from ${url}:`, error);
    return null;
  }
}
//homeContent()
async function homeContent() {
  const backData = new RepVideo();
  const fetchPromises = webSite.resources.map((resource) =>
    fetchData(resource.url)
  );
  const results = await Promise.all(fetchPromises);
  const classData = [];
  const filterData = {};
  results.forEach((data, index) => {
    if (!data || !data.class) return;
    const resource = webSite.resources[index];
    const { url, filter_tags, prepend_classes } = resource;
    classData.push({
      type_id: url,
      type_name: resource.name,
    });

    // 过滤掉不需要的分类
    let filteredClasses = data.class
      .filter((cls) => !filter_tags.includes(cls.type_name))
      .map((cls) => ({ n: cls.type_name, v: cls.type_id.toString() }));

    // 如果有前置分类，调整顺序
    if (prepend_classes && prepend_classes.length > 0) {
      const prependClasses = prepend_classes.map(name => {
        const found = filteredClasses.find(cls => cls.n === name);
        return found ? found : null;
      }).filter(cls => cls !== null);

      const remainingClasses = filteredClasses.filter(cls => !prepend_classes.includes(cls.n));

      filteredClasses = [...prependClasses, ...remainingClasses];
    }

    filterData[url] = [
      {
        key: "class",
        name: "分类",
        value: [{ n: "推荐", v: "" }, ...filteredClasses],
      },
    ];
  });
  backData.class = classData;
  backData.filters = filterData;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//searchContent("斗罗大陆")
async function searchContent(keyword) {
  const backData = new RepVideo();
  try {
    // 对关键词进行 URL 编码
    const encodedKeyword = encodeURIComponent(keyword);

    // 并发请求所有资源站点的搜索接口
    const fetchPromises = webSite.resources.map(resource => {
      const url = `${resource.url}${resource.url.includes('?') ? '&' : '?'}ac=detail&wd=${encodedKeyword}`;
      return fetchData(url);
    });

    // 等待所有请求完成
    const results = await Promise.all(fetchPromises);

    // 合并所有结果到一个列表中
    const videos = [];
    results.forEach((data, index) => {
      if (!data || !data.list) return;

      const resourceName = webSite.resources[index].name;

      data.list.forEach(item => {
        const videoDet = new VideoList();
        videoDet.vod_id = `${webSite.resources[index].url}${webSite.resources[index].url.includes('?') ? '&' : '?'}ac=detail&ids=${item.vod_id}`;
        videoDet.vod_name = item.vod_name;
        videoDet.vod_pic = item.vod_pic;
        videoDet.vod_remarks = `[${resourceName}] ${item.vod_remarks}`;
        videos.push(videoDet);
      });
    });

    backData.list = videos;
  } catch (error) {
    console.error('Error in searchContent:', error);
    backData.msg = error.message;
  }

  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

async function playerContent(vod_id) {
  let backData = new RepVideoPlayUrl();
   backData.url = vod_id
  backData.parse = 1;
  backData.header = headersToString(headers);
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
