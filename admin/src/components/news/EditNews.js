import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Grid, TextArea, Button, Menu, Dropdown, Label, Input} from 'semantic-ui-react'

// for editor
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

//for image
import uploadImage from '../../lib/uploadImage';

@withRouter
@inject("store")
@observer
class EditNews extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store.newsState;

        const { history } = this.props;
        
        console.log('constructor');

        let html = '';
        let contentBlock = null;
        let contentState = null;
        let editorState = null;

        this.state = {
            editorState: null
        };

        if(this.store.newsitem) {
            //console.log('not null');

            html = this.store.newsitem.subject;
            this.store.category = this.store.newsitem.category;

            contentBlock = htmlToDraft(html);

            if (contentBlock) {
                contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                editorState = EditorState.createWithContent(contentState);
                this.state = {
                    editorState,
                };
            }
        }else{
            console.log('null: ', this.props.match.params.id);
            //history.push('/news');
        }
    }

    
    componentWillMount() {
        console.log('componentWillMount');
        console.log(this.store.newsitem);

        const { history } = this.props;
        if(!this.store.newsitem){
            history.push('/news');
        }
       
    }
    
    /*
    //before render
    componentWillUpdate() {
        console.log('componentWillUpdate');
        console.log(this.store.newsitem.subject);

        this.state = {
            editorState: null
        };

        //this.store.fetchNewsItem(this.props.match.params.id)
        this.componentDidUpdate();
    }
    */
    
    
    componentDidMount() {
        console.log('componentDidMount');
        //this.store.fetchNewsItem(this.props.match.params.id)
        console.log('newsitem: ', this.store.newsitem);

    }

    componentDidUpdate() {
        //console.log('componentDidUpdate');
        /*
        if(this.store.newsitem !== null) {
            console.log(this.store.newsitem.subject);

            let html = '';
            let contentBlock = null;
            let contentState = null;
            let editorState = null;

            html = this.store.newsitem.subject;

            contentBlock = htmlToDraft(html);

            if (contentBlock) {
                contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                editorState = EditorState.createWithContent(contentState);
                this.state = {
                    editorState,
                };
            }
        }
        */
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    };

    handleCancel = (e) => {
        const { history } = this.props;
        history.push('/news');
    }

    handleDropdown = (e,{value}) => {
        console.log(value);
        //this.store.category = value;
        this.store.newsitem.category = value;
    }

    handleEdit = (e) => {
        const { history } = this.props;
        // TODO: check admin login
        this.store.updateNews(document.getElementById('newsData').value, history);
    }

    handleChangeTitle = (e, {value}) => {
        //console.log(value);
        this.store.newsitem.title = value;
    }

    render() {
        const { history } = this.props;
        const { newsitem, category } = this.store;
        //console.log('render: ', newsitem);

        let editView = null;

        if(newsitem) {
            const { editorState } = this.state;
            const friendOptions = [
                {text: 'maintenance', value: 'maintenance'},
                {text: 'news', value: 'news'},
                {text: 'event', value: 'event'},
            ]

            editView = (
                <div>
                
                <Grid textAlign='center'  >
                        <Grid.Row verticalAlign='middle' >
                            <Grid.Column style={{ maxWidth: 850, marginTop: '3em'  }}>
                                <h1>Edit News</h1>
                                <hr />
                                <div>
                                    <Dropdown 
                                        id='category' 
                                        placeholder='Select category' 
                                        fluid selection options={friendOptions} 
                                        onChange={this.handleDropdown}
                                        value={category === null ? '': newsitem.category}
                                        />
                                </div>
                                <div>
                                    <Input fluid id='title' value={ newsitem === null ? '' : newsitem.title } onChange={this.handleChangeTitle}></Input>
                                </div>
                                <Editor 
                                    editorState={editorState}
                                    wrapperClassName="demo-wrapper"
                                    editorClassName="demo-editor"
                                    toolbarClassName="toolbar-class"
                                    onEditorStateChange={this.onEditorStateChange}
                                    toolbar={{
                                        inline: { inDropdown: true },
                                        list: { inDropdown: true },
                                        textAlign: { inDropdown: true },
                                        link: { inDropdown: true },
                                        history: { inDropdown: true },
                                        image: { uploadCallback: uploadImage.uploadImageCallBack, alt: { present: true, mandatory: true } },
                                      }
                                    }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>

                    <Grid textAlign='center' columns={3}>
                        <Grid.Row verticalAlign='middle' style={{ maxWidth: 850}}>
                            <Grid.Column>
                                <div>
                                    <Button basic color='red' fluid size='small' onClick={this.handleCancel}>CANCEL</Button>
                                </div>
                            </Grid.Column>
                            <Grid.Column>
                                <div>
                                    <Button basic color='violet' fluid size='small' onClick={this.handleEdit}>EDIT</Button>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    { editorState == null ? <div></div> : <TextArea id='newsData'
                                                            disabled
                                                            hidden
                                                            value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                                                        />
                    }
                </div>
            )
        }

        return (
            <div>
                {editView}
            </div>
        );
      }
}


export default EditNews;