//
//  ViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/12/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import Parse

class ViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    
    var streams: [Stream]? = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .Default
        
        tableView.delegate = self
        tableView.dataSource = self
        
        Stream.getStreams({ (streams, success, error) -> () in
            if error == nil {
                self.streams = streams
                self.tableView.reloadData()
            }
        })
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return streams?.count ?? 0
    }

    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("StreamCell", forIndexPath: indexPath) as! StreamCell
        
        if (streams != nil) {
            cell.stream = streams![indexPath.row]
        }
       
        cell.selectionStyle = UITableViewCellSelectionStyle.None
        
        return cell
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {

        if segue.identifier == "showImagesSegue" {
            let photosViewController = segue.destinationViewController as! VerticalViewController
            let streamCell = sender as! StreamCell
            let indexPath = tableView.indexPathForCell(streamCell)
            let newStream = streams![indexPath!.row]
            photosViewController.streamId = newStream.id
            photosViewController.streamName = newStream.name
        }
        
    }
    
    @IBAction func backToCamera(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let nextViewController = storyBoard.instantiateViewControllerWithIdentifier("rootViewController") as! RootViewController
        self.presentViewController(nextViewController, animated:false, completion:nil)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}

