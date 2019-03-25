import React from 'react'
import kebabCase from 'lodash/kebabCase'
import throttle from 'lodash/throttle';
import { Link } from 'gatsby'
import moment from 'moment'
import Disqus from '../Disqus/Disqus'
import './style.scss'

class PostTemplateDetails extends React.Component {

  tocHeader = [];
  postHeader = [];

  componentDidMount() {
    this.registerEvent();
    this.setPostHeaderId();
    this.getHeaders();
  }

  componentWillUnmount() {
    this.unregisterEvent();
  }

  setPostHeaderId = () => {
    const headers = document.body.querySelectorAll('.post-single__body > h1, h2, h3, h4, h5, h6')
    headers.forEach(header => {
      const id = kebabCase(header.innerText)
      header.setAttribute('id', id)
    })
  }

  getHeaders = () => {
    const toc = document.body.querySelectorAll('.post-single__table_of_contents > ul > li')
    const headers = document.body.querySelectorAll('.post-single__body > h1, h2, h3, h4, h5, h6')
    this.tocHeader = toc;
    this.postHeader = headers;
  }

  onScroll = throttle(() => {
    const scrollTop = this.getScrollTop();
    Array.from(this.postHeader).forEach((header, index) => {
      if (scrollTop >= header.offsetTop) {
        const prev_active_header = document.body.querySelector('.active')
        if (prev_active_header) {
          prev_active_header.removeAttribute('class')
        }
        this.tocHeader[index].setAttribute('class', 'active')
      }
    })
  }, 250);

  getScrollTop = () => {
    if (!document.body) return 0;
    const scrollTop = document.documentElement
      ? document.documentElement.scrollTop || document.body.scrollTop
      : document.body.scrollTop;
    return scrollTop;
  };

  registerEvent = () => {
    window.addEventListener('scroll', this.onScroll);
  };

  unregisterEvent = () => {
    window.removeEventListener('scroll', this.onScroll);
  };


  render() {
    const { subtitle, author } = this.props.data.site.siteMetadata
    const post = this.props.data.markdownRemark
    const { tableOfContents } = post
    const tags = post.fields.tagSlugs

    const homeBlock = (
      <div>
        <Link className="post-single__home-button" to="/">
          All Articles
        </Link>
      </div>
    )

    const tagsBlock = (
      <div className="post-single__tags">
        <ul className="post-single__tags-list">
          {tags &&
            tags.map((tag, i) => (
              <li className="post-single__tags-list-item" key={tag}>
                <Link to={tag} className="post-single__tags-list-item-link">
                  {post.frontmatter.tags[i]}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    )

    const commentsBlock = (
      <div>
        <Disqus
          postNode={post}
          siteMetadata={this.props.data.site.siteMetadata}
        />
      </div>
    )

    return (
      <div>
        {homeBlock}
        <div className="post-single__table_of_contents" dangerouslySetInnerHTML={{ __html: tableOfContents }} />

        <div className="post-single">
          <div className="post-single__inner">
            <h1 className="post-single__title">{post.frontmatter.title}</h1>
            <div
              className="post-single__body"
              /* eslint-disable-next-line react/no-danger */
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <div className="post-single__date">
              <em>
                Published {moment(post.frontmatter.date).format('D MMM YYYY')}
              </em>
            </div>
          </div>
          <div className="post-single__footer">
            {tagsBlock}
            <hr />
            <p className="post-single__footer-text">
              {subtitle}
            </p>
            {commentsBlock}
          </div>
        </div>
      </div>
    )
  }
}

export default PostTemplateDetails
