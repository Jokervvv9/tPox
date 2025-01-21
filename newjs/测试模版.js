// {cateId}=分类ID  {catePg}=页码   {wd}=搜索关键字    1#电影,2#电视剧,3#综艺,4#动漫,19#短剧(首页显示的分类)
//http://www.hktv03.com/vod/type/id/{cateId}/page/{catePg}.html||http://www.hktv03.com/vod/search/wd/{wd}.html||1#电影,2#电视剧,3#综艺,4#动漫,19#短剧
const webSite = "";
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
};

const [cateUrl, searchUrl, webSiteCate] = webSite.split('||');
//categoryContent("2",1)
function extractAllContent(htmlString, baseUrl) {
  const list = []; // 存储所有提取的结果

  // 查找所有 data-original 或 data-src 的位置
  let dataOriginalIndex = 0;
  let attributeName = 'data-original="'; // 默认使用 data-original
  if (htmlString.indexOf(attributeName) === -1) {
      attributeName = 'data-src="'; // 如果 data-original 不存在，改用 data-src
  }

  while (true) {
      // 1. 查找 data-original 或 data-src 的内容
      dataOriginalIndex = htmlString.indexOf(attributeName, dataOriginalIndex);
      if (dataOriginalIndex === -1) break; // 如果没有找到，退出循环

      // 找到起始位置后，计算内容的起始位置
      const dataOriginalContentStartIndex = dataOriginalIndex + attributeName.length;
      // 从内容起始位置开始查找结束引号的位置
      const dataOriginalEndIndex = htmlString.indexOf('"', dataOriginalContentStartIndex);
      if (dataOriginalEndIndex === -1) break; // 如果没有结束引号，退出循环

      // 提取 data-original 或 data-src 属性的内容
      let vod_pic = htmlString.substring(dataOriginalContentStartIndex, dataOriginalEndIndex);
      console.log("找到 " + attributeName + " 的内容:", vod_pic);

      // 如果图片链接不是以 http 或 https 开头，添加 baseUrl
      if (!vod_pic.startsWith('http')) {
          vod_pic = baseUrl + vod_pic;
          console.log("修正后的图片链接:", vod_pic);
      }

      // 2. 向左查找 < 标识，确定标签的起始位置
      let tagStartIndex = dataOriginalIndex;
      while (tagStartIndex >= 0 && htmlString[tagStartIndex] !== '<') {
          tagStartIndex--;
      }
      if (tagStartIndex === -1) {
          console.log("未找到标签起始位置");
          dataOriginalIndex = dataOriginalEndIndex + 1; // 继续查找下一个 data-original 或 data-src
          continue;
      }

      // 3. 向右查找 > 标识，确定标签的结束位置
      const tagEndIndex = htmlString.indexOf('>', dataOriginalEndIndex);
      if (tagEndIndex === -1) {
          console.log("未找到标签结束位置");
          dataOriginalIndex = dataOriginalEndIndex + 1; // 继续查找下一个 data-original 或 data-src
          continue;
      }

      // 提取标签内容
      const tagContent = htmlString.substring(tagStartIndex, tagEndIndex + 1);
      console.log("提取的标签内容:", tagContent);

      // 4. 在标签区间内查找 title 的内容
      let vod_name = extractAttributeValue(tagContent, 'title');
      if (!vod_name) {
          // 如果 title 不存在，查找 alt 的内容
          const altContent = extractAttributeValue(tagContent, 'alt');
          if (altContent) {
              console.log("未找到 title，但找到 alt 的内容:", altContent);
              vod_name = altContent; // 将 alt 的值赋给 vod_name
          } else {
              console.log("未找到 title 和 alt 属性");

              // 如果未找到 title 和 alt，尝试从 <a> 标签中查找 title
              console.log("尝试查找 <a> 标签中的 title");

              // 查找 <a> 标签
              const aTagContent = findATag(htmlString, tagStartIndex);
              if (aTagContent) {
                  // 在 <a> 标签中查找 title 属性
                  vod_name = extractAttributeValue(aTagContent, 'title');
                  if (vod_name) {
                      console.log("找到 title 的内容:", vod_name);
                  } else {
                      console.log("未找到 title 属性");
                  }
              } else {
                  console.log("未找到 <a> 标签");
              }
          }
      } else {
          console.log("找到 title 的内容:", vod_name);
      }

      // 5. 在标签区间内查找 href 的内容
      let vod_id = extractAttributeValue(tagContent, 'href');
      if (!vod_id) {
          console.log("当前标签未找到 href 属性，尝试查找 <a> 标签");

          // 查找 <a> 标签
          const aTagContent = findATag(htmlString, tagStartIndex);
          if (aTagContent) {
              // 在 <a> 标签中查找 href 属性
              vod_id = extractAttributeValue(aTagContent, 'href');
              if (vod_id) {
                  console.log("找到 href 的内容:", vod_id);

                  // 如果找到 <a> 标签的 href，检查是否存在 title
                  const aTagTitle = extractAttributeValue(aTagContent, 'title');
                  if (aTagTitle) {
                      console.log("找到 <a> 标签的 title，替换原来的 vod_name:", aTagTitle);
                      vod_name = aTagTitle; // 用 <a> 标签的 title 替换原来的 vod_name
                  }
              } else {
                  console.log("未找到 href 属性");
              }
          } else {
              console.log("未找到 <a> 标签");
          }
      } else {
          console.log("找到 href 的内容:", vod_id);
      }

      // 如果 vod_id 不是以 http 或 https 开头，添加 baseUrl
      if (vod_id && !vod_id.startsWith('http')) {
          vod_id = baseUrl + vod_id;
          console.log("修正后的 href:", vod_id);
      }

      // 将结果保存到 list 数组中
      if (vod_pic) {
        const vodId = vod_name ? `${vod_name}||${vod_id}||${vod_pic}` : null;
        list.push({
            vod_pic: vod_pic,
            vod_name: vod_name || null,
            vod_id: vodId,
        });
    }

      // 继续查找下一个 data-original 或 data-src
      dataOriginalIndex = dataOriginalEndIndex + 1;
  }

  return list;
}

// 提取属性值
function extractAttributeValue(tagContent, attributeName) {
  const attributeStartIndex = tagContent.indexOf(`${attributeName}="`);
  if (attributeStartIndex === -1) return null;

  const valueStartIndex = attributeStartIndex + `${attributeName}="`.length;
  const valueEndIndex = tagContent.indexOf('"', valueStartIndex);
  if (valueEndIndex === -1) return null;

  return tagContent.substring(valueStartIndex, valueEndIndex);
}

// 查找 <a> 标签
function findATag(htmlString, currentIndex) {
  // 向左查找 <a> 标签
  let leftIndex = currentIndex - 1;
  while (leftIndex >= 0) {
      const aTagCandidateIndex = htmlString.lastIndexOf('<a', leftIndex);
      if (aTagCandidateIndex === -1) {
          break; // 未找到
      }

      // 检查 <a> 标签和当前标签之间是否有闭合标签（如 </div>）
      const betweenContent = htmlString.substring(aTagCandidateIndex, currentIndex);
      console.log(betweenContent);
      if (betweenContent.includes('<a ') ) {
          // 如果没有闭合标签，返回 <a> 标签内容
          const aTagEndIndex = htmlString.indexOf('>', aTagCandidateIndex);
          if (aTagEndIndex !== -1) {
              return htmlString.substring(aTagCandidateIndex, aTagEndIndex + 1);
          }
      }

      // 继续向左查找
      leftIndex = aTagCandidateIndex - 1;
  }

  // 向右查找 <a> 标签
  let rightIndex = currentIndex + 1;
  while (rightIndex < htmlString.length) {
      const aTagCandidateIndex = htmlString.indexOf('<a', rightIndex);
      if (aTagCandidateIndex === -1) {
          break; // 未找到
      }

      // 检查 <a> 标签和当前标签之间是否有闭合标签（如 </div>）
      const betweenContent = htmlString.substring(currentIndex, aTagCandidateIndex);
      if (!betweenContent.includes('</div>')) {
          // 如果没有闭合标签，返回 <a> 标签内容
          const aTagEndIndex = htmlString.indexOf('>', aTagCandidateIndex);
          if (aTagEndIndex !== -1) {
              return htmlString.substring(aTagCandidateIndex, aTagEndIndex + 1);
          }
      }

      // 继续向右查找
      rightIndex = aTagCandidateIndex + 1;
  }

  return null; // 未找到
}

// 从 URL 中提取域名部分
function getBaseUrl(url) {
  // 正则表达式匹配协议和主机名
  const regex = /^(https?:\/\/[^\/?#]+)/i;
  const match = url.match(regex);

  if (match) {
    return match[1];
  } else {
    console.error("无效的 URL");
    return null;
  }
}

//homeContent();
async function homeContent() {
  const backData = new RepVideo();
  // 将 webSiteCate 解析为对象数组
  const classData = webSiteCate.split(',').map(item => {
    const [type_id, type_name] = item.split('#');
    return { type_id: parseInt(type_id), type_name };
  });
  // 替换 backData 的 class 属性
  backData.class = classData;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

async function categoryContent(tid, pg = 1, extend) {
  const backData = new RepVideo();
  try {
    let url = cateUrl.replace('{cateId}', tid).replace('{catePg}', pg);
    const res = await req(url,{
      headers: headers,
    });
    const htmlString = await res.text();
    const list = extractAllContent(htmlString, getBaseUrl(url));
    backData.list = list;
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.message;
    await toast(`获取分类数据失败：${backData.msg}`,3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}



async function detailContent(ids) {
  const backData = new RepVideo();
  try {
    const [vod_name, webUrl, vod_pic] = ids.split('||');
    const response = await req(webUrl,{
      headers: headers,
    });
    const responseData = await response.text();
    const baseUrl = getBaseUrl(webUrl);
    const regex = /<a\s+[^>]*href="([^"]*(?:\/p\/\d+-\d+-\d+\.html?|play)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const result = [];
    const matches = responseData.matchAll(regex);
    for (const match of matches) {
      let href = match[1];
      const text = match[2].trim();
      const fullTag = match[0];
      if (!href.startsWith('http')) {
        href = `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`;
      }
      result.push({ text, href, fullTag });
    }
    function groupHrefs(data, htmlString) {
      const groups = []; // 存储分组结果
      let currentGroup = []; // 当前分组
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const href = item.href;
        const fullTag = item.fullTag;
        //如果fullTag包含<div就跳到尾部
        if(fullTag.includes("button") || fullTag.includes("icon-") || fullTag.includes("<img")){
          continue;
        }
        const aTagEnd = `</a>`;
        const nextATag = `<a`;
        const nextDivTag = `</div>`;
        const aTagIndex = htmlString.indexOf(fullTag) + fullTag.length;
        const nextATagIndex = htmlString.indexOf(nextATag, aTagIndex);
        const nextDivTagIndex = htmlString.indexOf(nextDivTag, aTagIndex);
        const isNextATagCloser = nextATagIndex !== -1 && (nextDivTagIndex === -1 || nextATagIndex < nextDivTagIndex);
        currentGroup.push(item);
        if (!isNextATagCloser) {
          // 如果 </div> 更近或没有下一个 <a>，则结束当前分组
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
            currentGroup = []; // 重置当前分组
          }
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      return groups;
    }
    const groupedData = groupHrefs(result, responseData);
    function formatGroupedData(groups) {
      // 用于存储已经处理过的分组
      const seenGroups = new Set();
      return groups
        .map((group) => {
          // 先将每个分组格式化为字符串
          const formattedGroup = group
            .map((item) => {
              const cleanedText = item.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
              // 如果 cleanedText 是 "查看更多" 或者为空，则跳过
              if (cleanedText === "查看更多" || !cleanedText) {
                return null;
              }
              return `${cleanedText}$${item.href}`; // 返回格式化后的项
            })
            .filter(item => item !== null) // 过滤掉 null 项
            .join('#'); // 组内用 # 串联
    
          // 如果该分组已经出现过，则返回空字符串
          if (seenGroups.has(formattedGroup)) {
            return '';
          }
    
          // 否则将该分组添加到已处理的分组集合中
          seenGroups.add(formattedGroup);
    
          return formattedGroup; // 返回格式化后的分组
        })
        .filter(group => group !== '') // 过滤掉空分组
        .join('$$$'); // 分组之间用 $$$ 串联
    }

    const formattedResult = formatGroupedData(groupedData);
    const detModel = new VideoDetail();
    // 用 $$$ 分割 formattedResult
    const sources = formattedResult.split('$$$');
    let vod_play_from = '';
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].trim()) { // 确保分割后的内容不为空
        if (vod_play_from) {
          vod_play_from += '$$$'; // 添加分隔符
        }
        vod_play_from += `播放源${i + 1}`; // 生成播放源名称
      }
    }
    detModel.vod_id = ids;
    detModel.vod_name = vod_name;
    detModel.vod_pic = vod_pic;
    detModel.vod_play_url = formattedResult;
    detModel.vod_play_from = vod_play_from;
    backData.list.push(detModel);
  } catch (error) {
    console.error('Error in detailContent:', error);
    backData.msg = error.message || error.statusText || 'Unknown error';
    await toast(`获取详情失败：${backData.msg}`, 3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}


/*
(async () => {
  const url = '铁锈味的雨滴||https://a.6080z.com/voddetail/101608.html||https://img.lzzyimg.com/upload/vod/20241123-1/d0167c1d73c68a1615765fd7864f5b75.jpg';
  const result = await detailContent(url);
  console.log(result);
})();
*/



async function playerContent(vod_id) {
  let backData = new RepVideoPlayUrl();
  backData.url = vod_id;
  backData.parse = 0;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

async function searchContent(keyword) {
  const backData = new RepVideo();
  try {

    let url = searchUrl.replace(/\{wd\}/g, encodeURIComponent(keyword));
    const pro = await req(url,{
      headers: headers,
    });
    const htmlString = await pro.text();
    const list = extractAllContent(htmlString, getBaseUrl(url));
    backData.list = list;
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.message;
    await toast(`获取分类数据失败：${backData.msg}`, 3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
