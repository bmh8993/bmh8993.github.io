import React from 'react'
import { getAllMarkdownRemark } from "./api"
import './style.scss';

export default ({ searchPost }) => {

  let keyword

  const edges = getAllMarkdownRemark();

  const handelChange = e => {
    keyword = e.target.value
  };

  const handelKeyPress = e => {
    if (e.charCode === 13) {
      handelSubmit();
    }
  };

  const handelSubmit = e => {
    //state 로 관리 안하니까 keyword 가 날라간다
    const filterd_posts = filter(edges, keyword);
    searchPost(filterd_posts)
    keyword = ''
  };

  const filter = (edges, keyword) => {

    const searced_post = edges.filter(edge => {
      const title = edge.node.frontmatter.title
      const tags = edge.node.frontmatter.tags
      const content = edge.node.internal.content

      if (title.includes(keyword)) {
        return edge
      }

      if (tags.includes(keyword)) {
        return edge
      }

      if (content.includes(keyword)) {
        return edge
      }
    })

    return searced_post
  }

  return (
    <div className="search_form">
      <input
        name="keyword"
        paceholder="Search"
        onKeyPress={handelKeyPress}
        onChange={handelChange}
        value={keyword}
      />
      <div onClick={handelSubmit}>전송</div>
    </div>
  );
}