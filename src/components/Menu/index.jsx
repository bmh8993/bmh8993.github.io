import kebabCase from 'lodash/kebabCase'
import React from 'react'
import { Link } from 'gatsby'
import './style.scss'

class Menu extends React.Component {
  render() {
    const menu = this.props.data
    const menuBlock = (
      <ul className="menu__list">
        {menu.map(item => (
          <li className="menu__list-item" key={item.path}>
            {!item['sub_menu'] ?
              <Link
                to={item.path}
                className="menu__list-item-link"
                activeClassName="menu__list-item-link menu__list-item-link--active"
              >
                {item.label}
              </Link>
              :
              <React.Fragment>
                <span>{item.label}</span>
                <ul className="menu__list__sub_menu__list">
                  {item.sub_menu.map(sub_item => (
                    <li className="menu__list-item" key={sub_item.path}>
                      <Link
                        to={`/categories/${kebabCase(sub_item.path)}`}
                        className="menu__list-item-link"
                        activeClassName="menu__list-item-link menu__list-item-link--active"
                      >
                        {sub_item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            }
          </li>
        ))}
      </ul>
    )

    return <nav className="menu">{menuBlock}</nav>
  }
}

export default Menu
