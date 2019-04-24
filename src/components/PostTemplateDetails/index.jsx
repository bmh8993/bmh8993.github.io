import React from 'react'
import kebabCase from 'lodash/kebabCase'
import throttle from 'lodash/throttle';
import { Link } from 'gatsby'
import moment from 'moment'
import Disqus from '../Disqus/Disqus'
import './style.scss'

class PostTemplateDetails extends React.Component {

  HeaderManager = {
    tocHeader: [],
    postHeader: [],
    setPostHeaderId() {
      const headers = document.body.querySelectorAll('.post-single__body > h1, h2, h3, h4, h5, h6')
      if (!headers) {
        return
      }
      headers.forEach(header => {
        const id = encodeURI(kebabCase(header.innerText))
        header.setAttribute('id', id)
      })
      this._getHeaders()
      this.setActiveHeader(0)
    },

    _getHeaders() {
      const toc = document.body.querySelectorAll('.post-single__table_of_contents-list-item')
      const headers = document.body.querySelectorAll('.post-single__body > h1, h2, h3, h4, h5, h6')
      this.tocHeader = toc;
      this.postHeader = headers;
    },
    setActiveHeader(index) {
      if (!this.tocHeader.length) {
        return
      }

      const prev_active_header = document.body.querySelector('.active')
      if (prev_active_header) {
        prev_active_header.classList.remove('active');
      }

      this.tocHeader[index].classList.add('active')
    }
  }

  CopyMaker = {
    makeCopyButton() {
      const code_blocks = document.body.querySelectorAll('.gatsby-highlight > .language-text');
      code_blocks.forEach(code_block => {
        const button = document.createElement('button');
        button.innerHTML = 'copy';
        button.className = "copy-button";
        button.onclick = this._cpoy;
        code_block.insertAdjacentElement('afterbegin', button)
      })
    },
    _cpoy: (e) => {
      const target = e.target.nextSibling;
      let range, select;

      if (document.createRange) {
        range = document.createRange();
        range.selectNode(target)
        select = window.getSelection();
        select.removeAllRanges();
        select.addRange(range);
        document.execCommand('copy');
      } else {
        range = document.body.createTextRange();
        range.moveToElementText(target);
        range.select();
        document.execCommand('copy');
      }
    }
  }

  componentDidMount() {
    this.registerEvent();
    this.HeaderManager.setPostHeaderId();
    this.CopyMaker.makeCopyButton();
  }

  componentWillUnmount() {
    this.unregisterEvent();
  }

  onScroll = throttle(() => {
    const scrollTop = this.getScrollTop();
    Array.from(this.HeaderManager.postHeader).forEach((header, index) => {
      if (scrollTop >= header.offsetTop) {
        this.HeaderManager.setActiveHeader(index)
      }
    })
    if (scrollTop === 0) {
      this.HeaderManager.setActiveHeader(0)
    }
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
    const category = this.props.data.markdownRemark.frontmatter.category
    const path = post.frontmatter.path
    const tags = post.fields.tagSlugs

    const homeBlock = (
      <div>
        <Link className="post-single__home-button" to="/">
          Home
        </Link>
      </div>
    )

    const backBlock = (
      <div>
        <button className="post-single__back-button" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    )

    const tableOfContents = (
      <ul className="post-single__table_of_contents-list">
        {post &&
          post.headings.map(header => (
            <li className="post-single__table_of_contents-list-item" key={header.value} style={{ paddingLeft: `${header.depth - 1}rem` }}>
              <Link to={`${path}#${encodeURI(kebabCase(header.value))}`} className="post-single__table_of_contents-list-item-link">
                {header.value}
              </Link>
            </li>
          ))}
      </ul>
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
        {/* backBlock */}
        <div className="post-single__table_of_contents" >
          {tableOfContents}
        </div>

        <div className="post-single">
          <div className="post-single__inner">
            <h1 className="post-single__title">{post.frontmatter.title}</h1>

            <div className="post-single__meta">
              <Link to={`/categories/${category}/`} className="post-single__meta-link">
                {category}
              </Link>
              <span>·</span>
              <em>
                {moment(post.frontmatter.date).format('YYYY.MM.DD hh:ss')}
              </em>
            </div>

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
