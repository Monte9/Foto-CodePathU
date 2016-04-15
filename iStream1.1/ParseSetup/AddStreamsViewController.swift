//
//  AddStreamsViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/15/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class AddStreamsViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {

    @IBOutlet weak var tableView: UITableView!
    
    var addStreams: [Stream]? = []
    
    var imageToAdd: UIImage?
    
    var names: [String] = ["San Francisco", "Super Bowl", "Hiking", "Movie", "Date", "New York", "1 WTC", "Stawp it!"]
    var namesIndex: Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.delegate = self
        tableView.dataSource = self
        
        Stream.getStreams({ (streams, success, error) -> () in
            if error == nil {
                self.addStreams = streams
                self.tableView.reloadData()
            }
        })

    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return addStreams?.count ?? 0
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("AddStreamCell", forIndexPath: indexPath) as! AddStreamCell
        
        if (addStreams != nil) {
            cell.stream = addStreams![indexPath.row]
        }
        
        cell.selectionStyle = UITableViewCellSelectionStyle.None
        
        return cell
    }
    
    @IBAction func addNewStream(sender: AnyObject) {
        print("New stream add button clicked")
        let newStream = Stream(name: names[namesIndex])
        namesIndex += 1
        addStreams?.append(newStream)
        tableView.reloadData()
    }
    
    @IBAction func onCancelButton(sender: AnyObject) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let rootViewController = storyBoard.instantiateViewControllerWithIdentifier("rootViewController") as! RootViewController
        self.presentViewController(rootViewController, animated:false, completion:nil)
    }
    
    @IBAction func addImageToStreams(sender: UITapGestureRecognizer) {
        print("Got the touch")
        if (imageToAdd != nil) {
            let newImage = Image(image: imageToAdd!, id: "vo4f3JTtGw")
            print("THIS IS THE ONE: \(newImage)")
            
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
