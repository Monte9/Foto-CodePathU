//
//  AddStreamsViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/15/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class AddStreamsViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, AddStreamCellDelegate {

    @IBOutlet weak var tableView: UITableView!
    
    var allStreams: [Stream]? = []
    var addStreams: [Stream]? = []
    var imageToAdd: UIImage?
    
    var names: [String] = ["San Francisco", "Super Bowl", "Hiking", "Movie", "Date", "New York", "1 WTC", "Stawp it!"]
    var namesIndex: Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .Default
        
        tableView.delegate = self
        tableView.dataSource = self
        
        Stream.getStreams({ (streams, success, error) -> () in
            if error == nil {
                self.allStreams = streams
                self.tableView.reloadData()
            }
        })

    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return allStreams?.count ?? 0
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("AddStreamCell", forIndexPath: indexPath) as! AddStreamCell
        
        cell.selectionStyle = UITableViewCellSelectionStyle.None
        cell.delegate = self
        
        if (allStreams != nil) {
            cell.stream = allStreams![indexPath.row]
            cell.selectSwitch.on = allStreams![indexPath.row].shouldAddImage ?? false
        }
        
        return cell
    }
    
    @IBAction func addNewStream(sender: AnyObject) {
        print("New stream add button clicked")
        let newStream = Stream(name: names[namesIndex])
        namesIndex += 1
        allStreams?.append(newStream)
        tableView.reloadData()
    }
    
    @IBAction func onCancelButton(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let rootViewController = storyBoard.instantiateViewControllerWithIdentifier("rootViewController") as! RootViewController
        self.presentViewController(rootViewController, animated:false, completion:nil)
    }
    
    func selectSwitch(selectSwitch: AddStreamCell, didChangeValue value: Bool) {
        let indexPath = tableView.indexPathForCell(selectSwitch)
        allStreams![indexPath!.row].shouldAddImage = true
    }
    
    @IBAction func addImageToStreams(sender: UITapGestureRecognizer) {
        print("Got the touch")
        if (imageToAdd != nil) {
            
            for (var i=0; i<allStreams?.count; i += 1) {
                //check if the switch of the stream is on. 
                //If yes, then add it to the addStreams var
                
                if (allStreams![i].shouldAddImage == true ) {
                    addStreams?.append(allStreams![i])
                    print("Adding image to \(allStreams![i].name) right?")
                }
            }
            
            for (var i=0; i<addStreams?.count; i += 1) {
                let newImage = Image(image: imageToAdd!, id: addStreams![i].id)
            }
            
            let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
            let rootViewController = storyBoard.instantiateViewControllerWithIdentifier("toStreams") as! UINavigationController
            self.presentViewController(rootViewController, animated:false, completion:nil)
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
