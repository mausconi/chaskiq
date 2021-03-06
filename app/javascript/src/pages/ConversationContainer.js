import React, {Component} from 'react'
import {
  Route,
  Link,
  Switch,
  withRouter
} from 'react-router-dom'

import sanitizeHtml from 'sanitize-html';

import { connect } from 'react-redux'

import {
  RowColumnContainer,
  ColumnContainer,
  GridElement,
  FixedHeader,
  ConversationsButtons,
  Overflow
} from '../components/conversation/styles'

import Hidden from '@material-ui/core/Hidden'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import InboxIcon from '@material-ui/icons/Inbox'
import FilterListIcon from '@material-ui/icons/FilterList'
import ChatIcon from '@material-ui/icons/Chat'
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import UserListItem from '../components/conversation/UserListItem'
import Progress from '../shared/Progress'
import FilterMenu from '../components/conversation/filterMenu'

import ConversationContainerShow from '../components/conversation/container'
import image from '../../../assets/images/empty-icon8.png'
import {
  getConversations, 
  updateConversationsData,
  clearConversations,
} from '../actions/conversations'

import {
  getAppUser 
} from '../actions/app_user'

import AssignmentRules from '../components/conversation/assignmentRules'
import {setCurrentSection, setCurrentPage} from '../actions/navigation'

class ConversationContainer extends Component {

  constructor(props){
    super(props)
    this.fetching = false
    this.props.dispatch( clearConversations([]) )
  }

  componentDidMount(){
    this.getConversations({page: 1})

    this.props.dispatch(
      setCurrentSection('Conversations')
    )
  }

  handleScroll = (e) => {
    let element = e.target

    //console.log(element.scrollHeight - element.scrollTop, element.clientHeight)
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.props.conversations.meta.next_page && !this.fetching){
        this.fetching = true
        this.getConversations({}, ()=>{
          this.fetching = false
        })
      }
    }
  }

  getConversations = (options, cb)=>{
    this.props.dispatch(getConversations(options, ()=>{
      cb && cb()
    }))
  }

  setSort = (option)=>{
    this.props.dispatch(updateConversationsData({sort: option}))
    this.setState({sort: option})
  }

  setFilter = (option)=>{
    this.props.dispatch(updateConversationsData({filter: option}))
  }

  filterButton = (handleClick)=>{
    return <Tooltip title="filter conversations">

        <Button
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          variant={"outlined"}
          onClick={handleClick}
          size="small"
        >
          {/*<MoreVertIcon />*/}
          {this.props.conversations.filter}
        </Button>

       </Tooltip>
  }

  sortButton = (handleClick)=>{
    return <Tooltip title="sort conversations">
        <Button
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          variant={"outlined"}
          onClick={handleClick}
          size="small"
        >
          {/*<MoreVertIcon />*/}
          {this.props.conversations.sort}
        </Button>

       </Tooltip>
  }

  filterConversations = (options, cb)=>{
    this.props.dispatch(
      updateConversationsData({filter: options.id, collection: []}, ()=>{
        this.getConversations({page: 1}, cb)
      })
    )
  }

  sortConversations = (options, cb)=>{
    this.props.dispatch(
      updateConversationsData({sort: options.id, collection: []}, ()=>{
        this.getConversations({page: 1}, cb)
      })
    )
  }

  renderConversationContent = (o)=>{
    const message = o.lastMessage.message
    if(message.htmlContent)
      return sanitizeHtml(message.htmlContent).substring(0, 250)
  }

  renderConversations = (appId)=>{
    return <GridElement noFlex style={{
                boxShadow: 'rgba(204, 204, 204, 0.52) 8px -4px 20px 0px'
              }}>
              {/*<FixedHeader>Conversations</FixedHeader>*/}
              
              <FixedHeader style={{height: '67px'}}>
          
                {/*<HeaderTitle>
                  Conversations
                </HeaderTitle>*/}

                <ConversationsButtons>

                  <FilterMenu 
                    options={[
                      {id: "opened", name: "opened", count: 1, icon: <InboxIcon/> },
                      {id: "closed", name: "closed", count: 2, icon: <CheckIcon/>},
                    ]}
                    value={this.props.conversations.filter}
                    filterHandler={this.filterConversations}
                    triggerButton={this.filterButton}
                  />

                  <FilterMenu 
                    options={[
                      {id: "newest", name: "newest", count: 1, selected: true},
                      {id: "oldest", name: "oldest", count: 1},
                      {id: "waiting", name: "waiting", count: 1},
                      {id: "priority-first", name: "priority first", count: 1},
                      {id: "unfiltered", name: "all", count: 1 }
                    ]}
                    value={this.props.conversations.sort}
                    filterHandler={this.sortConversations}
                    triggerButton={this.sortButton}
                  />

                </ConversationsButtons>

              </FixedHeader>

              <Overflow onScroll={this.handleScroll}>


                {
                  this.props.conversations.collection.map((o, i)=>{

                    const user = o.mainParticipant

                    return <div 
                              key={o.id} 
                              onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.key}`) }>
                                      
                              <UserListItem
                                value={this.props.conversation.key}
                                mainUser={user}
                                object={o.key}
                                messageUser={o.lastMessage.appUser}
                                showUserDrawer={()=>this.props.actions.showUserDrawer(user.id)}
                                messageObject={o.lastMessage}
                                conversation={o}
                                createdAt={o.lastMessage.message.createdAt}
                                message={this.renderConversationContent(o)}
                              />

                              {/*<MessageItem 
                                conversation={o} 
                                message={o.lastMessage}
                              />*/}
                            </div>
                  })
                }

                {this.props.conversations.loading ? 
                  <Progress/> 
                : null }

              </Overflow>
            </GridElement>
  }


  render(){
    const {appId} = this.props.match.params

    return <RowColumnContainer>

            <ColumnContainer>
              
    
              <Hidden smUp>
                <Route exact path={`/apps/${appId}/conversations`}
                  render={(props)=>(
                    this.renderConversations(appId)
                  )}
                /> 
              </Hidden>

              <Hidden smDown>
                { 
                  this.renderConversations(appId)
                }
              </Hidden>

              {/*
                <Drawer 
                open={this.state.displayMode === "conversations"} 
                onClose={this.hideDrawer}>
                {this.renderConversations()}
                </Drawer>
              */}

              <Switch>


                <Route exact path={`/apps/${appId}/conversations`}
                  render={(props)=>(
                    <EmptyConversation dispatch={this.props.dispatch}/>
                  )} />  
                

                <Route exact path={`/apps/${appId}/conversations/assignment_rules`} 
                    render={(props)=>(
                      <GridElement grow={2} style={{
                        display: 'flex', 
                        justifyContent: 'space-around'
                      }}>

                        <AssignmentRules/>

                        
                      </GridElement>
                  )} /> 


                <Route exact path={`/apps/${appId}/conversations/:id`} 
                    render={(props)=>(
                      <ConversationContainerShow
                        appId={appId}
                        app={this.props.app}
                        events={this.props.events}
                        conversation={this.props.conversation}
                        showUserDrawer={this.props.actions.showUserDrawer}
                        currentUser={this.props.currentUser}
                        {...props}
                      />
                  )} /> 

              </Switch>

            </ColumnContainer>
          </RowColumnContainer>
  }
}


class EmptyConversation extends Component {

  componentDidMount(){
    this.props.dispatch(setCurrentPage("Conversations"))
  }

  render(){
    return <Hidden smDown>
            <GridElement grow={2} style={{
              display: 'flex', 
              justifyContent: 'space-around'
            }}>

              <div style={{alignSelf: 'center'}}>
                <Paper style={{padding: '2em'}}>

                    <ChatIcon fontSize="large" />
                    <Typography variant="h5">
                        Conversations 
                      </Typography>

                      <Typography component="p">
                        Select a conversation
                      </Typography>

                    <img 
                      width="300px"
                      src={image}/>

                </Paper>
              </div>
            </GridElement>
          </Hidden>

  }
}

function mapStateToProps(state) {

  const { auth, app, conversations, conversation, app_user } = state
  const { loading, isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    conversation,
    app_user,
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(ConversationContainer))