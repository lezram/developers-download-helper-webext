
export default class NotificationHelper {

    public static create(title:string, message:string, duration=5, success=false){
        let id: string = "ID" + Math.random().toString(16).slice(2) +"-"+ (new Date()).getTime();

        let icon = "images/icon-48.png";
        if(!success){
            icon= "images/icon-red-48.png";
        }

        chrome.notifications.create(id, {
            type: "basic",
            iconUrl: icon,
            title: title,
            message: message,
            requireInteraction: true
        } );

        if(duration){
            setTimeout(function(){
                chrome.notifications.clear(id);
            }, duration*1000);
        }

        return id;
    }
}