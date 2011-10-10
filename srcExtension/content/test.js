
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.msg = "a message 2";

theApp.Test =
{

	anjtest1: function ()
	{
		prompts.alert(window, "Noojee Click", "hello world");
		//prompts.alert(window, "Noojee Click", "hi");
	},

	anjtest: function()
	{
		prompts.alert(window, "Noojee Click", theApp.msg);
	}

};

}});

