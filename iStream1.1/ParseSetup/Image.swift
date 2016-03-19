//
//  Image.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/16/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import Parse

class Image: NSObject {

    var image: UIImage?
    var date: String?
    var location: String?
    var streamId: String?
    var imageId: String?
    
    override init() {
    }
    
    init(image: UIImage, id: String?) {
        super.init()
        self.image = image
        self.date = getDate()
        self.location = "San Francisco"
        self.streamId = id
        
        //Save images in a stream to Parse
        let storeImage = PFObject(className: "Image")
        
        let imageData = UIImageJPEGRepresentation(self.image!, 0.1)
        let imageFile = PFFile(data: imageData!)
        
        storeImage["image"] = imageFile
        storeImage["date"] = date
        storeImage["location"] = location
        storeImage["streamId"] = streamId
        
        storeImage.saveInBackgroundWithBlock { (success: Bool, error: NSError?) -> Void in
            if error != nil {
                print("Oops.. unable to save image on stream to Parse! ERROR: \(error?.localizedDescription)")
            } else {
                let id = storeImage.objectId
                self.imageId = id
                print("Image on stream created and saved to parse successfully")
            }
        }
    }
    
    //Method to get all images in stream from Parse
    class func getImagesInStream(streamId: String?, completionHandler: (images: [Image]?, success: Bool?, error: NSError?)-> ()) {
        
        var images: [Image]? = []
        
        //Use Grand Central Dispatch to make sure all images are completly downloaded
        let downloadGroup = dispatch_group_create()
        
        //construct query
        let query = PFQuery(className: "Image")
        query.whereKey("streamId", equalTo:streamId!)
        query.findObjectsInBackgroundWithBlock { (objects: [PFObject]?, error: NSError?) -> Void in
            if error == nil {
                for object in objects! {
                    if let originalImage = object["image"] as? PFFile {
                        
                        dispatch_group_enter(downloadGroup)
                        
                        originalImage.getDataInBackgroundWithBlock({ (imageData: NSData?, error: NSError?) -> Void in
                            if error == nil {
                                let addimage = Image()
                                addimage.image = UIImage(data: imageData!)
                                addimage.date = object["date"] as? String
                                addimage.location = object["location"] as? String
                                images?.insert(addimage, atIndex: 0)
                                dispatch_group_leave(downloadGroup)
                            }}, progressBlock: { (amountDone: Int32) -> Void in
                                // Update your UI with download progress here (if needed)
                        })
                    }
                }
                
                dispatch_group_notify(downloadGroup, dispatch_get_main_queue()) {
                    // This will be called when all your downloads are complete
                    print("GO GO GO Grand Central Dispatch!!")
                    completionHandler(images: images, success: true, error: nil)
                }
                
            } else  {
                print("Unable to get streams from Parse")
                completionHandler(images: nil, success: false, error: error)
            }
        }
    }
    
    func getDate() -> String {
        let getDate = NSDate()
        let calendar = NSCalendar.currentCalendar()
        let unitFlags: NSCalendarUnit = [.Hour, .Day, .Month, .Year]
        let components = calendar.components(unitFlags, fromDate: getDate)
        let date = "\(components.day)/\(components.month)/\(components.year)"
        
        return date
    }
    
}
