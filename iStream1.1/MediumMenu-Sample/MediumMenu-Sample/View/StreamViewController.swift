//
//  StreamViewController.swift
//  MediumMenu
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

class StreamViewController: BaseViewController, UITableViewDataSource, UITableViewDelegate {
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: NSBundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    @IBOutlet weak var tableView: UITableView!
    var streams = ["1", "2"]
    var numCell: Int = 2
    
    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.dataSource = self
        tableView.delegate = self
        // Do any additional setup after loading the view.
        
        
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "icon"), style: UIBarButtonItemStyle.Plain, target: self, action: Selector("onAddingStream:"))
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return streams.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("StreamCell", forIndexPath: indexPath) //as! StreamViewCell
        print("row\(indexPath.row)")
        return cell
    }
    
    //DELETE a cell
    func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        print("On deletion")
        if editingStyle == UITableViewCellEditingStyle.Delete {
            streams.removeAtIndex(indexPath.row)
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: UITableViewRowAnimation.Automatic)
            numCell--
            
        }
    }
    
    func onAddingStream(sender: UIBarButtonItem) {
        
        print("on editing")
        if (numCell < 3) {
            numCell++
            streams.append("new stream")
            //tableView.frame = CGRectMake(tableView.frame.origin.x, tableView.frame.origin.y, tableView.frame.size.width, tableView.contentSize.height + 250)
            tableView.reloadData()
        }
        else if(numCell == 5) {
            let alertController = UIAlertController(title: "iStream", message:
                "You have to much sterams! Save one to create a new", preferredStyle: UIAlertControllerStyle.Alert)
            alertController.addAction(UIAlertAction(title: "Ok", style: UIAlertActionStyle.Default,handler: nil))
            
            self.presentViewController(alertController, animated: true, completion: nil)
            print("Promt: You have to much sterams! Save one to create a new")
        }
        else{
            streams.append("new stream")
            numCell++
            tableView.reloadData()
        }
        //
        //            //tableView.contentSize = CGSize(width: tableView.frame.size.width, height: tableView.frame.size.height + 179)
        print("on editing")
        //}
        
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "streamsToDetail" {
            let cell = sender as! UITableViewCell
            let indexPath = tableView.indexPathForCell(cell)
            let detailViewController = segue.destinationViewController as! DetailViewController
        }
    }

    
}
