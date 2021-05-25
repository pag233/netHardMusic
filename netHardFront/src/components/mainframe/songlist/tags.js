import React, { useState, useEffect } from "react";
import { useParams } from "react-router";

import { AnchorPopup } from "../../common/popup";
import Icons from "../../common/icons";

import "./tags.scss";
const tagsCategory = [
  {
    category: "语种",
    tags: ["华语", "欧美", "日语", "汉语", "粤语", "小语种"],
  },
  {
    category: "风格",
    tags: [
      "流行",
      "摇滚",
      "民谣",
      "电子",
      "说唱",
      "轻音乐",
      "爵士",
      "乡村",
      "R&B/Soul",
      "古典",
      "民族",
      "英伦",
      "金属",
      "朋克",
      "蓝调",
      "雷鬼",
      "世界音乐",
      "拉丁",
      "另类/独立",
      "New Age",
      "古风",
      "Boosa Nova",
      "后摇",
      "舞曲",
      "音乐剧",
    ],
  },
  {
    category: "场景",
    tags: [
      "清晨",
      "夜晚",
      "学习",
      "工作",
      "午休",
      "下午茶",
      "地铁",
      "驾车",
      "运动",
      "旅行",
      "散步",
      "酒吧",
    ],
  },
  {
    category: "情感",
    tags: [
      "怀旧",
      " 清新",
      " 浪漫",
      " 伤感",
      " 治愈",
      " 放松",
      " 孤独",
      " 感动",
      " 兴奋",
      " 快乐",
      " 安静",
      " 思念",
    ],
  },
  {
    category: "主题",
    tags: [
      "综艺",
      " 影视原声",
      " ACG",
      " 儿童",
      " 校园",
      " 游戏",
      " 70后",
      " 80后",
      " 90后",
      " 网络歌曲",
      " KTV",
      " 经典",
      " 翻唱",
      " 吉他",
      " 钢琴",
      " 器乐",
      " 榜单",
      " 00后",
    ],
  },
];

function Tag({ activeCount, className, children, setActiveCount, isSelect }) {
  const [selectedTag, setSelectedTag] = useState(isSelect);
  return (
    <li
      className={className}
      onClick={() => {
        if (selectedTag) {
          setSelectedTag(false);
          setActiveCount((a) => a + 1);
        } else {
          if (activeCount > 0) {
            setSelectedTag(true);
            setActiveCount((a) => a - 1);
          }
        }
      }}
    >
      <span className={"name" + (selectedTag ? " selected-tag" : "")}>
        {children}
        {selectedTag && Icons.close}
      </span>
    </li>
  );
}

export default function AddTagsPopup({ anchorRef, button, closePopup, tags }) {
  const { songlist_id } = useParams();
  let matchTagIdx = 0;
  const maxSelectTag = 3;
  const [selectCount, setSelectCount] = useState(maxSelectTag - tags.length);
  useEffect(() => {
    const body = document.getElementById("main-body");
    body.style.overflowY = "hidden";
    return () => {
      body.style.overflowY = "scroll";
    };
  }, []);
  return (
    <AnchorPopup
      anchorRef={anchorRef}
      alignToAnchor="left"
      topOffset={10}
      closePopup={closePopup}
    >
      <div className={"add-tags-holder"}>
        <div className="add-tags">
          <div className="close" onClick={closePopup}>
            {Icons.close}
          </div>
          <h3 className="title">添加标签</h3>
          <div className="tag-list">
            <span className="sub-title">
              选择合适的标签，最多可选
              <span className="red">{maxSelectTag}</span>个
            </span>
            {tagsCategory.map((category, idx) => (
              <ul key={"category" + idx} className="tags-category">
                <li className="category">{category.category}</li>
                <ul className="tags">
                  {category.tags.map((tag, idx) => {
                    let isSelect = false;
                    if (tags[matchTagIdx] === tag) {
                      isSelect = true;
                      matchTagIdx++;
                    }
                    return (
                      <Tag
                        className="tag"
                        key={idx}
                        activeCount={selectCount}
                        setActiveCount={setSelectCount}
                        isSelect={isSelect}
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </ul>
              </ul>
            ))}
          </div>
        </div>
        <div className="tag-confirm">{button({ songlist_id })}</div>
      </div>
    </AnchorPopup>
  );
}
