
//import Auth0Variables from './auth0-variables'
import Auth0Lock from 'auth0-lock'
import React, {Component, PropTypes} from 'react'
import StandardDropdownMenu from 'gComponents/utility/standard-dropdown-menu'
import DropDown from 'gComponents/utility/drop-down/index.js'
import {DropDownListElement} from 'gComponents/utility/drop-down/index.js'
import {LinkSettings} from 'gComponents/utility/links/index.js'
import * as meActions from 'gModules/me/actions.js'
import * as modalActions from 'gModules/modal/actions.js'
import * as navigationActions from 'gModules/navigation/actions.js'
import Icon from 'react-fa'
import './style.css'

import { connect } from 'react-redux';


@connect()
export default class Profile extends Component {
  displayName: 'Profile'

  signUp(){
    this.props.dispatch(meActions.signUp())
  }

  signIn(){
    this.props.dispatch(meActions.signIn())
  }

  logOut(){
    this.props.dispatch(meActions.logOut())
  }

  _openModal() {
    this.props.dispatch(modalActions.openSettings())
  }

  profileDropdown () {
    const profile = this.props.me.profile
    const hasPrivateAccess = profile.has_private_access

    let listElements = [
      {icon: 'question', header: 'FAQ', onMouseDown: () => {navigationActions.navigate('/faq')}},
      {icon: 'sign-out', header: 'Sign Out', onMouseDown: this.logOut.bind(this)}
    ]

    if (!!hasPrivateAccess) {
      listElements = [
        {icon: 'user', header: 'account', onMouseDown: this._openModal.bind(this)},
        ...listElements
      ]
    }

    return (
      <div className='item'>
        <DropDown
            headerText={profile.name}
            openLink={<img className='avatar' src={profile.picture}/>}
            ref='dropdown'
        >
          <ul>
            {listElements.map(props => <DropDownListElement {...props} key={props.icon} closeOnClick={true} dropDown={this.refs.dropdown}/>)}
          </ul>
        </DropDown>
      </div>
    )

  }
  render () {
    const {me, isLoggedIn} = this.props

    return (
    <div className='header-right-menu'>

      { isLoggedIn &&
        <a className='item' href={`/models/new`}>
          <Icon name='plus'/>
          <span className='text'>New Model</span>
        </a>
      }

      { isLoggedIn && me.id &&
        <a className='item' href={`/users/${me.id}`}>
          <Icon name='th-large'/>
          <span className='text'>My Models</span>
        </a>
      }

      { isLoggedIn && this.profileDropdown() }

      { !isLoggedIn &&
        <a className={'item text'} href='/models'>Explore</a>
      }

      { !isLoggedIn &&
        <a className={'item text'} onClick={this.signIn.bind(this)}>Sign In</a>
      }

      { !isLoggedIn &&
        <a className={'item text'}onClick={this.signUp.bind(this)}>Sign Up</a>
      }
    </div>
    )
  }
}
