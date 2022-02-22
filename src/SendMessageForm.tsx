import React, {useState, useCallback} from 'react'

const MessageForm = (props) => {
    const provider = props.provider;
    const signer = props.signer;

    const [formData, setFormData] = useState({
        title: "",
        body: ""
      });
    
    const handleSubmit = useCallback(async()=>{
      
    },[])

    return (
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
        <input onChange={(e) => setFormData({...formData, title: e.target.value})} value={formData.title} type="text" name="title" id="title" />
        <label htmlFor="body">Body</label>
        <textarea onChange={(e) => setFormData({...formData, body: e.target.value})}  value={formData.body} name="body" id="body"></textarea>
        <input type="submit" value="Submit" />
        </form>
      );
}

export default MessageForm;