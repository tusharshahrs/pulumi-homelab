* **Pre-Requisites**

1.  Sign up for a okta [developer account](https://developer.okta.com/)

2.  Make sure you are in the developer console.  Click on `Add Person` box.

    <img src="images/1__Developer_Console_Add_Person.png" alt = Developer Console Add Person>
- Check your user inbox email and validate the account.

3. Switch over to **Classic UI**
- Go to the top left where it says: `Developer Console`.  Click on the drop down and select **Classic UI**

    <img src="images/2__Switch_from_Developer_Console_to_Classic_Console.png" alt = Switch from Developer to Classic UI>

4. Add applications while in **Classic UI** mode ->
- Click on `Applications` -> `Add Application`

    <img src="images/3___Add_Application_via_classic_UI.png" alt = Add Application via classic ui>

5. Search for `AWS`.  You want `AWS Account Federation`

    <img src="images/4__Search_for_aws_Account_Federation.png" alt = Search for aws account federation app>

6. Now you can run your `pulumi` code.

** Validation Steps **

7. Select your application
    - Stay in the **Classic UI** console-> `Applications` -> Click on your application name that shows up.  For Example:  AWS ** POC

       <img src="images/5__Validation_Select_Your_Application.png" alt = Select on your application that was created after `pulumi up`> 

8. Click on `Sign On` and validate your settings by scrolling down.

           <img src="images/6__Sign_On.png" alt = Validate settings in Sign On> 