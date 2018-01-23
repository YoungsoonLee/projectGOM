import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Grid, TextArea, Button, Menu, Dropdown, Label, Input, Modal, Header, Icon} from 'semantic-ui-react'

// for editor
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

//import NewsItemWrapper from '../wrapper/NewsItemWrapper';

//@NewsItemWrapper
@withRouter
@inject("store")
@observer
class DetailNews extends Component {
    constructor(props) {
		super(props);
        this.store = this.props.store;
    }


    componentDidMount() {
        this.store.newsState.errorFlash = null;
        this.store.newsState.fetchNewsItem(this.props.match.params.id)
    }

    handleClickEdit = (e) => {
        const { history } = this.props;
        const { newsitem } = this.store.newsState;
        history.push('/edit_news/'+newsitem.id)
    }

    handleClickDelete = (e) => {
        const { history } = this.props;
        this.store.newsState.deleteNews(history);
    }

    state = { modalOpen: false }
    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ modalOpen: false })

    render() {
        const { newsitem, errorFlash } = this.store.newsState;

        var errorFlashView = null;
        if(errorFlash) {
            errorFlashView = (
                <Message error visible size='tiny'>{errorFlash}</Message>
            );
        }


        return (
                <Container style={{ marginTop: '5em' }}>
                
                    <div className="page post">
                        {errorFlashView}
                        <Link to="/news">← Back to News</Link>
                        {!!newsitem &&
                            <article>
                                <h1>{newsitem.category}</h1>
                                <h2>{newsitem.title}</h2>
                                <p dangerouslySetInnerHTML={{__html: newsitem.subject}}></p>
                                <p>{newsitem.created_at}</p>
                            </article>}
                        <hr />
                    </div>
                    <Grid textAlign='center' columns={3}>
                        <Grid.Row verticalAlign='middle' style={{ maxWidth: 850}}>
                            <Grid.Column>
                                
                                <Modal
                                    trigger={<Button basic color='red' fluid size='small' onClick={this.handleOpen}>DELETE</Button>}
                                    open={this.state.modalOpen}
                                    onClose={this.handleClose}
                                    basic
                                    size='small'
                                >
                                    <Header icon='trash' content='Delete news' />
                                    <Modal.Content>
                                        <h3>Do you really want delete this news? </h3>
                                    </Modal.Content>
                                    <Modal.Actions>
                                        <Button color='red' onClick={this.handleClickDelete} inverted>
                                            <Icon name='checkmark' /> DELETE
                                        </Button>
                                    </Modal.Actions>
                                </Modal>
                                
                            </Grid.Column>
                            <Grid.Column><Link to="/news">← Back to News</Link></Grid.Column>
                            <Grid.Column>
                                <div>
                                    <Button basic color='violet' fluid size='small' onClick={this.handleClickEdit}>EDIT</Button>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>
            
        );
    }
}


export default DetailNews;