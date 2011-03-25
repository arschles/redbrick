crlf = '\r\n';

//expects a string
this.singleline = function(data)
{
    return '+'+data+crlf;
}

this.statuscode = this.singleline;

//expects a string
this.error = function(data)
{
    return '-'+data+crlf;
}

//expects an integer
this.integer = function(i)
{
    return ':'+i+crlf;
}

//expects an array - will concatenate it into a single string where each element of the array is split by a crlf
this.bulk = function(data)
{
    data = data.join(crlf);
    return '$' + data.length + crlf + data + crlf;
}

//expects an array
this.multibulk = function(data)
{
    ret = '*'+data.length+crlf;
    for(var i = 0; i < data.length; i++)
    {
        if(data[i] == null || data[i] == undefined) ret += '$-1'+crlf;
        else ret += '$'+data[i].length+crlf+data[i]+crlf;
    }
    return ret;
}