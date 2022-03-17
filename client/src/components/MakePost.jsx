import React from "react";
import { useNavigate} from "react-router-dom";
//import { Link} from "react-router-dom";
import $ from "jquery";
const hljs = require("highlight.js")


// Registration Component
function MakePost() {
    const navigate = useNavigate();
    let tags = [];
    $(document).ready(() => {
        updatePostPreview();
    
        $("#submitButton").click(() => {
            console.log($("#postTextarea").val());
    
            //Epoch timestamp code based on https://futurestud.io/tutorials/get-number-of-seconds-since-epoch-in-javascript 
            const currentTime = new Date();
            const utcMilllisecondsSinceEpoch = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60 * 1000);
            const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
    
            const postData = {
                user: "Prototype",
                time: utcSecondsSinceEpoch,
                content: $("#postTextarea").val(),
                tags: tags
            };
    
            fetch("/submitPost", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(postData)
                }).then(res => console.log("Post submitted!")
            );
    
            // window.location.reload();
            navigate("/wall");
        });
    
        //Mark highlighted text as code
        $("#codeButton").click(() => {
            let selectedText = getSel("postTextarea");
            if (!selectedText)
                return;
            
            let htmlText = $("#postTextarea").val().replace(selectedText, `<pre><code>${selectedText}</code></pre>`);
            $('#postTextarea').val(htmlText);
            updatePostPreview();
        });
    
        //Update post preview
        $("#postTextarea").bind("input propertychange", () => {
            updatePostPreview();
        });
    
        $(".tagToAdd").click(function() {
            tags.push(this.parentNode.innerText);
            this.parentNode.parentNode.removeChild(this.parentNode);
            updatePostPreview();
        });
        $(".tagToAdd").mouseover(function() {
           this.style = "background-color: green;"; 
        });
        $(".tagToAdd").mouseout(function() {
            this.style = "";
         });
    });
    
    function updatePostPreview()
    {
        //Extract portions within code tags because hljs only works if those characters aren't escaped
        //But other characters need to be escaped to appear correctly, especially newlines
    
        let baseText = $("#postTextarea").val();
    
        const codeStart = "<pre><code>";
        const codeEnd = "</code></pre>";
    
        let replacedText = "";
        let index = 0;
    
        while (baseText.length > 0)
        {
            if (baseText.indexOf(codeStart) === index)
            {
                if (index > 0)
                {
                    let text = baseText.substring(0, index);
                    replacedText += text;
                }
    
                let end = baseText.indexOf(codeEnd) + codeEnd.length;
                let snippet = baseText.substring(index, end);
                replacedText += snippet;
                baseText = baseText.substring(end + 1);
    
                index = 0;
            }
            else if (baseText[index] === "\n")
            {
                if (index > 0)
                {
                    let text = baseText.substring(0, index);
                    replacedText += text;
                }
    
                replacedText += "<br/>";
                baseText = baseText.substring(index + 1);
    
                index = 0;
            }
            else if (baseText[index] === " ")
            {
                if (index > 0)
                {
                    let text = baseText.substring(0, index);
                    replacedText += text;
                }
    
                replacedText += "&nbsp;";
                baseText = baseText.substring(index + 1);
    
                index = 0;
            }
            else
            {
                index++;
    
                if (index > baseText.length)
                {
                    replacedText += baseText;
                    break;
                }
            }
        }
    
        $("#postPreview").html(replacedText);
    
        hljs.highlightAll();
    
        let tagPreview = "<ul>";
        for (let tag of tags) {
            tagPreview += `<li> <button class="addedTag">` + tag + "</button></li>";
        }
        tagPreview += "</ul>";
        $("#tagPreview").html(tagPreview);
    
        $(".addedTag").click(function() {
            tags.splice(tags.indexOf(this.innerHTML), 1);
            this.parentNode.removeChild(this);
    
            let buttonElement = document.createElement("button");
            buttonElement.innerHTML = this.innerHTML;
            buttonElement.setAttribute("class", "tagToAdd");
            
            buttonElement.onclick = function() {
                tags.push(this.innerText);
                this.parentNode.parentNode.removeChild(this.parentNode);
                updatePostPreview();
            };
            buttonElement.mouseover = function() {
                this.style = "background-color: green;"; 
            }
            buttonElement.mouseout = function() {
                this.style = "";
            }

            let newListElement = document.createElement("li");
            newListElement.append(buttonElement);

            $("#tagSelection").append(newListElement);

            $(".tagToAdd").mouseover(function() {
                this.style = "background-color: green;"; 
             });
             $(".tagToAdd").mouseout(function() {
                 this.style = "";
              });
    
            updatePostPreview();
        });

        $(".addedTag").mouseover(function() {
            this.style = "background-color: red;";
        });
        $(".addedTag").mouseout(function() {
            this.style = "";
        });
    }
    
    //Return the highlighted portion of a textarea
    //Courtesy of https://stackoverflow.com/questions/717224/how-to-get-selected-text-in-textarea
    function getSel(name) // javascript
    {
        // obtain the object reference for the <textarea>
        var txtarea = document.getElementById(name);
        // obtain the index of the first selected character
        var start = txtarea.selectionStart;
        // obtain the index of the last selected character
        var finish = txtarea.selectionEnd;
        // obtain the selected text
        var sel = txtarea.value.substring(start, finish);
        // do something with the selected content
    
        return sel;
    }

    return <div className="container">
        <title>Make Post</title>
        <h1>Make Post</h1>

        <textarea id="postTextarea" rows="25" cols="120"></textarea>
        <br />

        <ul id="tagSelection">
            <li> <button className="tagToAdd">JavaScript</button></li>
            <li> <button className="tagToAdd">C++</button></li>
            <li> <button className="tagToAdd">Web Dev</button></li>
            <li> <button className="tagToAdd">Embedded Systems</button></li>
            <li> <button className="tagToAdd">Computer Graphics</button></li>
            <li> <button className="tagToAdd">C#</button></li>
        </ul>

        <button id="codeButton">Highlight Code Snippet</button>
        <button id="submitButton">Submit</button>

        <br />

        <h2>Post Preview:</h2>
        <div id="postPreview" style={{border: "1px solid black"}}></div>
        <p>Tags:</p> <div id="tagPreview"></div>
    </div>
}

export default MakePost;